var moment = require('moment');

var React     = require('react'),
    Bootstrap = require('react-bootstrap');

var ChatMessage = require('./ChatMessage.jsx');

module.exports = React.createClass({
  componentWillUpdate: function() {
    var node = this.refs.scroll.getDOMNode();
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  },
  componentDidUpdate: function() {
    if (this.shouldScrollBottom) {
      var node = this.refs.scroll.getDOMNode();
      node.scrollTop = node.scrollHeight;
    }
  },
  render: function() {
    var messageNodes = [];
    for (var i = 0; i < this.props.messages.length; i++) {
      var message = this.props.messages[i];
      var timestamp = moment(message.timestamp).format('HH:mm');

      var author, authorRole;
      if (i > 0 && message.type === 'say' && this.props.messages[i-1].type === 'say'
        && message.author === this.props.messages[i-1].author) {
        author = authorRole = null;
        if (timestamp === moment(this.props.messages[i-1].timestamp).format('HH:mm'))
          timestamp = null;
      } else {
        author = message.author;
        authorRole = message.authorRole;
      }

      messageNodes.push(<ChatMessage key={message.id} author={author} authorRole={authorRole} type={message.type} timestamp={timestamp} content={message.content} target={message.target} duration={message.duration} />);
    }

    return (
      <div id='chat-history'>
        <h3>Chat History</h3>
        <ol ref='scroll'>
          {messageNodes}
        </ol>
      </div>
    );
  }
});
