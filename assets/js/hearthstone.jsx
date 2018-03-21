import React from 'react';
import ReactDOM from 'react-dom';

export default function run_hearthstone(root, channel) {
  ReactDOM.render(<Hearthstone channel={channel} />, root);
}

class Hearthstone extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = ({
      player: " ",
      deck: 0,
      opp_deck: 0,
      hand: [ ],
      opp_hand: 0,
      minions: [ ],
      opp_minions: [ ],
      mana: 0,
      opp_mana: 0,
      health: 0,
      opp_health: 0,
    });

    this.channel.join()
                .receive("ok", this.joinGame.bind(this))
                .receive("error", resp => console.log(resp));

    this.channel.on("update", this.update.bind(this));
    this.channel.on("start", this.startMatch.bind(this));
    this.channel.on("turnchange", this.update.bind(this));
  }

  joinGame(resp) {
    console.log("joined called");
    if (resp.game) {
      window.player = resp.player;
      this.setState(resp.game);
    } else {
      window.player = resp.player;
    }
  }

  update(game) {
    this.setState(game.game);
  }

  startMatch(game) {
    this.setState(game.game);
  }

  render() {
    return (
      <div>
        <ul>
          <li>{"Player: " + window.player}</li>
          <li>{"Turn: " + this.state.player}</li>
          <li>{"Deck: " + this.state.deck}</li>
          <li>{"Opp Deck: " + this.state.opp_deck}</li>
          <li>{"Hand: "} <Cards cards={this.state.hand} /></li>
          <li>{"Opp Hand: " + this.state.opp_hand}</li>
          <li>{"Minions: "} <Cards cards={this.state.minions} /></li>
          <li>{"Opp Minions: "} <Cards cards={this.state.opp_minions} /></li>
          <li>{"Mana: " + this.state.mana}</li>
          <li>{"Opp Mana: " + this.state.opp_mana}</li>
          <li>{"Health: " + this.state.health}</li>
          <li>{"Opp Health: " + this.state.opp_health}</li>
        </ul>
      </div>
    );
  }
}

function Cards(props) {
  return (
    _.map(props.cards, (card, ii) => {
      return (
        <span>
          {"ID " + card.id}
          {" , Attack: " + card.attack}
          {" , Health: " + card.health}
          {" , Cost: " + card.cost}
          {" , Can Attack: " + card.can_attack}
          <br /> 
        </span>
      );
    })
  );
}
