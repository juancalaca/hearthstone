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

  renderDeck(player) {
    const deckSize = player == 'player' ? this.state.deck : this.state.opp_deck;
    return (
      <div class="deck">
        <p class="deck-size">
          {deckSize}
        </p>
      </div>
    );
  }

  renderPlayer(player) {
    const className;
    const playerName = window.player;
    if(player == 'player' && playerName == 'player1') {
      className = 'ashe';
    }
    else if(player == 'player' && playerName == 'player2') {
      className = 'GARROSH';
    }
    else if(player == 'opponent' && playerName == 'player1') {
      className = 'GARROSH';
    }
    if(player == 'player' && playerName == 'player2') {
      className = 'ashe';
    }
    var health = player == 'player' ? this.state.health : this.state.opp_health;
    return (
      <div class=className>
        <p class="player-health">{health}</p>
      </div>
    )
  }

  renderOppHand() {
    const size = this.state.opp_hand;
    const handArray = [];
    //just make an array of size 'size' so that i can map over it
    for(let i = 0; i < size; i ++) {
      handArray.push("card")
    }
    //class cards should put cards side by side
    return (
      <div class="cards">
        {handArray.map(function(card, index) { //for what it's worth, these variables dont matter
          return (
            <Card
              inHand={true} 
              key={'opp-hand-' + index}
              opponent={true}
            />
          );
        }, this)};
      </div>
    );
  }

  renderPlayerHand() {
    const { hand } = this.state;

    return (
      <div class="cards">
        {hand.map(function(card, index) { //okay these variables are more useful
          return (
            <Card 
              attack={card.attack}
              can_attack={false} //im assuming it's false anyway when it's in hand...
              cost={card.cost}
              //id={card.id}
              inHand={true}
              health={card.health}
              title={card.title}
            />
          );
        }, this)};
      </div>
    );
  }

  //gonna do this without max mana for now
  renderMana(player) {
    const mana = player == 'player' ? mana : opp_mana;
    const manaArray = [];
    //same conept with renderOppHand
    for(let i = 0; i < mana; i++) {
      manaArray.push("mana")
    }
    //the cards class should also put these side by side, but it might be better to have a special mana class
    return (
      <div class="cards">
        {manaArray.map(function(card, index) {
          return (
            <div class="mana-crystal-unspent"></div>
          );
        }, this)};
        <p class="mana-label">{mana}</p>
      </div>
    );

    const handArray = [];
    //just make an array of size 'size' so that i can map over it
    for(let i = 0; i < size; i ++) {
      handArray.push("card")
    }
    //class cards should put cards side by side
    return (
      <div class="cards">
        {handArray.map(function(card, index) { //for what it's worth, these variables dont matter
          return (
            <Card
              inHand={true} 
              key={'opp-hand-' + index}
              opponent={true}
            />
          );
        }, this)};
      </div>
    );

  }

  render() {
    return (
      <div>
        <div class="enemy-side">
          <div class="enemy-hand">
            {renderOppHand()}
          </div>
          <div class="player-stats">
            <div class="avatar">
              {renderPlayer('opponent')}
            </div>
            <div class="mana">
              {renderMana()}
            </div>
            <div class="deck">
              {renderDeck()}
            </div>
          </div>
          <div class="battlefield">
            {renderBattlefield()}
          </div>
        </div>
        <div class="player-side">
          <div class="enemy-hand">
            {renderPlayerHand()}
          </div>
          <div class="player-stats">
            <div class="avatar">
              {renderPlayer('player')}
            </div>
            <div class="mana">
              {renderMana()}
            </div>
            <div class="deck">
              {renderDeck()}
            </div>
          </div>
          <div class="battlefield">
            {renderBattlefield()}
          </div>
        </div>
      </div>
    )
    /*return (
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
    );*/
  }
}

//todo af: clickhandler
class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id, attack, inHand, health, cost, title, can_attack, opponent, key } = this.props;
    
    if(opponent && inHand) {
      return {
        <div class="backwards-card">
        </div>
      }
    }
    
    const className = inHand ? "card-in-hand" : "card-on-field";


    return {
      <div class={className} key='key'>
        <h6>{title}</h6>
        <p>Attack: {attack}</p>
        <p>Health: {health}</p>
        <p>Cost: {cost}</p>
      </div>
    }
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
