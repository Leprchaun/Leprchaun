var moment = require('moment');

var React = require('react');

var MoneyPotUser = require('./MoneyPotUser.jsx');

module.exports = React.createClass({
  render: function() {
    switch (this.props.type) {
      case 'connect':
      case 'disconnect':
        return null;
      case 'say':
        var node = [];
        if (this.props.author)
          node.push(<MoneyPotUser key='author' name={this.props.author} className={this.props.authorRole} />);
        if (this.props.timestamp)
          node.push(<span key='timestamp' className='text-muted text-center'>{this.props.timestamp}</span>);
        node.push(<span key='content'>{this.props.content}</span>);

        return (
          <li className={(this.props.author ? 'chat-block ' : '') + 'chat-say'}>
            {node}
          </li>
        );
      case 'mute':
      case 'shadowmute':
        var duration = moment.duration(this.props.duration/1000, 'seconds').humanize();
        return (
          <li className='chat-mute'>
            <MoneyPotUser name={this.props.author} /> {this.props.type === 'shadowmute' ? 'shadow muted' : 'muted'} <MoneyPotUser name={this.props.target} /> for {duration}.
          </li>
        );
    }
  }
});
