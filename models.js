var config = require('./config.json');

var sequelize = require('sequelize');

module.exports = function(logger) {
  var db = new sequelize(
    config.mariasql.database,
    config.mariasql.username,
    config.mariasql.password,
    {
      dialect: 'mariadb',
      logging: false
    }
  );

  db.authenticate().complete(function(error) {
    if (error) {
      logger.error('Unable to connect to database:', error.message);
      process.exit(1);
    } else {
      logger.info('Successfully connected to database.');
    }
  });

  var Game = db.define('Game', {
    id: { type: sequelize.INTEGER.UNSIGNED, primary: true },
    multiplier: sequelize.BIGINT.UNSIGNED,
    hash: sequelize.CHAR(64),
    verified: sequelize.ENUM('none', 'hash', 'multiplier')
  }, {
    tableName: 'games'
  });

  var ChatMessage = db.define('ChatMessage', {
    author: sequelize.STRING,
    authorRole: { type: sequelize.ENUM('admin', 'moderator', 'user'), field: 'author_role'},
    type: sequelize.ENUM('connect', 'disconnect', 'say', 'mute', 'shadowmute'),
    timestamp: sequelize.DATE,
    content: sequelize.STRING(499),
    target: sequelize.STRING,
    duration: sequelize.BIGINT.UNSIGNED
  }, {
    tableName: 'chat_messages',
    timestamps: false
  });

  db.sync().complete(function(error) {
    if (error) {
      logger.error('Unable to synchronise database schemata:', error.message);
    } else {
      logger.info('Successfully synchronised database schemata.');
    }
  });

  return {
    Game: Game,
    ChatMessage: ChatMessage
  };
};
