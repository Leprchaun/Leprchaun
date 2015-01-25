var React = require('react');

module.exports = React.createClass({
  render: function() {
    var status, statusSymbol;
    if (this.props.status == 'connected') {
      status = <span> Connected</span>;
      statusSymbol = <span className='glyphicon glyphicon-ok' aria-hidden='true'></span>;
    } else if (this.props.status == 'disconnected'){
      status = <span> Disconnected</span>;
      statusSymbol = <span className='glyphicon glyphicon-remove' aria-hidden='true'></span>;
    }

    return (
      <div>
        <span>Connection Status: </span>
        { statusSymbol }
        { status }
      </div>
    );
  }
});
