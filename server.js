var config  = require('./config.json'),
    utility = require('./utility.js');

var Promise   = require('bluebird'),
    express   = require('express'),
    exphbs    = require('express-handlebars'),
    fs        = require('fs'),
    http      = require('http'),
    https     = require('https'),
    moneypot  = require('moneypot'),
    sequelize = require('sequelize'),
    io        = require('socket.io'),
    winston   = require('winston');

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console(config.logging.console),
    new winston.transports.File(config.logging.file)
  ]
});

var models = require('./models.js')(logger);

new moneypot.Session().then(function(results) {
  var session = results[0];

  logger.info('Successfully connected to MoneyPot.');
  models.ChatMessage.create({
    type: 'connect',
    timestamp: Date.now()
  });

  session.socket.on('disconnect', function() {
    logger.info('Disconnected from MoneyPot.');
    models.ChatMessage.create({
      type: 'disconnect',
      timestamp: Date.now()
    });
  });

  session.socket.on('game_crash', function(data) {
    var id = session.game.id;
    models.Game.find({
      where: { verified: 'multiplier' },
      order: 'id DESC'
    }).then(function(game) {
      var rounds, expectedHash;
      if (game !== null) {
        rounds = id - game.id;
        expectedHash = game.hash;
      } else {
        rounds = id - config.verification.offset + 1;
        expectedHash = config.verification.terminatingHash;
      }

      var terminatingHash    = utility.terminatingHash(data.hash, rounds),
          expectedMultiplier = utility.multiplierFromHash(data.hash, config.verification.clientSeed),
          verified;
      if (terminatingHash !== expectedHash) {
        logger.warn('Hash mismatch in game ' + id + ' with received hash ' + data.hash + '.');
        verified = 'none';
      } else if (data.game_crash !== expectedMultiplier) {
        logger.warn('Multiplier mismatch in game ' + id + ' with verified hash ' + data.hash + ' and multiplier '
        + data.game_crash/100 + 'x (expected ' + expectedMultiplier/100 + 'x).');
        verified = 'hash';
      } else {
        logger.verbose('Successfully verified game ' + id + '.');
        verified = 'multiplier';
      }

      models.Game.create({
        id: id,
        multiplier: data.game_crash,
        hash: data.hash,
        verified: verified
      }).then(function(game) {
        sockets.emit('game_verification', {
          id: game.id,
          multiplier: game.multiplier,
          hash: game.hash,
          verified: game.verified
        });
      });
    });
  });
  session.socket.on('msg', function(message) {
    switch (message.type) {
      case 'say':
        break;
      case 'mute':
        var duration = message.timespec.substring(0, message.timespec.length - 1),
            unit     = message.timespec.substring(message.timespec.length - 1);

        switch (unit) {
          case 'd': duration *= 24;
          case 'h': duration *= 60;
          case 'm': duration *= 60;
          case 's': duration *= 1000;
        }

        message.type = message.shadow ? 'shadowmute' : 'mute';
        var target = message.username;
        message.username = message.moderator;
        break;
      default:
        logger.warn('Unknown chat message type: ' + message.type);
        return;
    }
    models.ChatMessage.create({
      author: message.username,
      authorRole: message.role,
      type: message.type,
      timestamp: new Date(message.time),
      content: message.message,
      target: target,
      duration: duration
    }).then(function(message) {
      sockets.emit('chat_message', message);
    });
  });
});

var app = express();
app.disable('etags');
app.engine('handlebars', exphbs());
app.use(express.static(__dirname + '/public/'));
app.set('view engine', 'handlebars');
require('./routes.js')(app);
var sslCredentials = {
  key:  fs.readFileSync(config.ssl.key),
  cert: fs.readFileSync(config.ssl.certificate)
};
var server  = https.createServer(sslCredentials, app),
    sockets = io.listen(server);

sockets.on('connection', function(socket) {
  logger.verbose('Client ' + socket.id + ' connected from ' + socket.conn.remoteAddress + '.');
  var bundle;
  sequelize.Promise.all([
    models.Game.findAll({
      order: 'id DESC',
      limit: config.initialGames
    }),
    models.ChatMessage.findAll({
      order: 'id DESC',
      limit: config.initialMessages
    })
  ]).then(function(results) {
    var gameVerifications = [],
        chatMessages      = [];
    for (var i = 0; i < results[0].length; i++) {
      gameVerifications.unshift(results[0][i].values);
    }
    for (var i = 0; i < results[1].length; i++) {
      chatMessages.unshift(results[1][i].values);
    }
    socket.emit('initialisation', {
      gameVerifications: gameVerifications,
      chatMessages: chatMessages
    });
  })
  socket.on('disconnect', function() {
    logger.verbose('Client ' + socket.id + ' disconnected.');
  })
});

server.listen(443);

var redirect = express();
redirect.get('*', function(req, res) {
  res.redirect('https://leprchaun.io' + req.url);
});
http.createServer(redirect).listen(80);
