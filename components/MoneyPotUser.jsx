var React = require('react');

module.exports = React.createClass({
  render: function() {
    return <a className={this.props.className + ' chat-author'} href={'https://www.moneypot.com/user/' + this.props.name} target='_blank'>{this.props.name}</a>;
  }
});
