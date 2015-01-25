var React = require('react');

module.exports = React.createClass({
  render: function() {
    var shortenedHash = this.props.hash.substring(0, 4) + '…' + this.props.hash.substring(this.props.hash.length - 4);

    var status, statusSymbol;
    switch (this.props.verified) {
      case 'multiplier':
        status = 'Verified';
        statusSymbol = <span className='glyphicon glyphicon-ok'></span>;
        break;
      case 'hash':
      case 'none':
        status = 'Mismatch';
        statusSymbol = <span className='glyphicon glyphicon-remove'></span>;
    }

    return (
      <tr className={status === 'Mismatch' ? 'danger' : null}>
        <td><a href={'https://www.moneypot.com/game/' + this.props.id} target='_blank'>{ this.props.id }</a></td>
        <td>{ (this.props.multiplier/100).toFixed(2) }x</td>
        <td>{ shortenedHash }</td>
        <td className={(status === 'Mismatch'? 'red' : 'green') + ' text-right'}>{ status } { statusSymbol }</td>
      </tr>
    );
  }
});
