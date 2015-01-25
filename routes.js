require('node-jsx').install();
var React = require('react');

var MainPage = require('./components/MainPage.jsx');

module.exports = function(app) {
  app.get('/', function(req, res) {
    var markup = React.renderToString(React.createElement(MainPage));
    res.render('main', {
      react: markup
    });
  });
};
