var React     = require('react'),
    Bootstrap = require('react-bootstrap');

var Row              = Bootstrap.Row,
    Col              = Bootstrap.Col,
    VerificationLog  = require('./VerificationLog.jsx'),
    ChatLog          = require('./ChatLog.jsx'),
    ConnectionStatus = require('./ConnectionStatus.jsx');

module.exports = React.createClass({
  componentDidMount: function() {
    function resizeScrollers() {
      if (jQuery(window.width) < 992) {
        jQuery('tbody, ol').height(500);
        return;
      }
      var height = jQuery(window).height() - jQuery('.page-header').outerHeight(true) - jQuery('#footer').outerHeight() - jQuery('h3').outerHeight(true);
      jQuery('tbody').height(height-jQuery('thead').outerHeight(true));
      jQuery('ol').height(height);
    }
    jQuery(window).resize(resizeScrollers);
    resizeScrollers();

    var socket = io.connect();
    socket.on('connect', function() {
      this.setState({ connectionStatus: 'connected' });
    }.bind(this));
    socket.on('disconnect', function() {
      this.setState({ connectionStatus: 'disconnected' });
    }.bind(this));

    socket.on('initialisation', function(bundle) {
      this.setState({
        gameVerifications: bundle.gameVerifications,
        chatMessages: bundle.chatMessages
      });
    }.bind(this));
    socket.on('game_verification', function(game) {
      var games = this.state.gameVerifications.concat(game);
      this.setState({ gameVerifications: games });
      if (game.verified !== 'multiplier')
        new Audio('/alarm.mp3').play();
    }.bind(this));
    socket.on('chat_message', function(message) {
      var messages = this.state.chatMessages.concat(message);
      this.setState({ chatMessages: messages });
    }.bind(this));
  },
  getInitialState: function() {
    return {
      connectionStatus: 'disconnected',
      gameVerifications: [],
      chatMessages: []
    };
  },
  render: function() {
    return (
      <div>
        <Col xs={12} className='page-header'>
          <h1>Leprchaun<small>.io</small></h1>
        </Col>
        <div className='container'>
          <Row>
            <Col md={6}>
              <VerificationLog games={this.state.gameVerifications} />
            </Col>
            <Col md={6}>
              <ChatLog messages={this.state.chatMessages} />
            </Col>
          </Row>
        </div>
        <Col xs={12} id='footer'>
          <ConnectionStatus status={this.state.connectionStatus} />
        </Col>
      </div>
    );
  }
});
