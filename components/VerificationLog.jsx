var React     = require('react'),
    Bootstrap = require('react-bootstrap');

var Table            = Bootstrap.Table,
    GameVerification = require('./GameVerification.jsx');

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
    var gameNodes = this.props.games.map(function(game) {
      return <GameVerification key={game.id} id={game.id} multiplier={game.multiplier} hash={game.hash} verified={game.verified} />;
    });

    return (
      <div id='game-verifications'>
        <h3>Verification Log</h3>
        <Table>
          <thead>
            <th>#</th>
            <th>Multiplier</th>
            <th>Hash</th>
            <th className='text-right'>Status</th>
          </thead>
          <tbody ref='scroll'>
            { gameNodes }
          </tbody>
        </Table>
      </div>
    );
  }
});
