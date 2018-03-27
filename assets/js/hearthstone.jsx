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
      selected: {},
    });

    this.channel.join()
                .receive("ok", this.joinGame.bind(this))
                .receive("error", resp => console.log(resp));

    this.channel.on("update", this.update.bind(this));
    this.channel.on("start", this.startMatch.bind(this));
    this.channel.on("turnchange", this.update.bind(this));
    this.cardClickHandler = this.cardClickHandler.bind(this);
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
    console.log("updating game")
    this.setState(game.game);
  }

  startMatch(game) {
    console.log("starrted match")
    this.setState(game.game);
  }

  //if opponent = true, it belongs to the opponent
  cardClickHandler(location, index, opponent) {
    console.log("handling from hearthstone.jsx")
    const { selected } = this.state;
    //if no card is selected and the selected card is an opponents
    if(selected == {} && !opponent) {
      //then this card becomes 'selected'
      const newSelected = { location, index };
      this.setState({ selected: newSelected });
      return;
    }
    if(selected.location == 'battlefield') {
      if(opponent && location == 'battlefield') {
        //THIS.FIGHT(index) 
        return;
      }
    }
    this.setState({ selected: {} });
    //hopefully this means literally anything other condition will
    //result in nothing happening. make sure to test it.
  }

  renderDeck(player) {
    const deckSize = player == 'player' ? this.state.deck : this.state.opp_deck;
    return (
      <div className="deck">
        <p className="deck-size">
          {deckSize}
        </p>
      </div>
    );
  }

  renderPlayer(player) {
    let className;
    const playerName = window.player;
    /* ill do this logic later
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
    }*/ //LOL ITS JAINA NOT ASHE YOU NOOB
    if(player == 'player') {
      className = 'jaina'
    }
    else {
      className = "GARROSH"
    }
    className += ' player-avatar text-center'
    var health = player == 'player' ? this.state.health : this.state.opp_health;
    return (
      <div className={className}>
        <p className="player-health">{health}</p>
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
      <div className="container">
        <p>OPPHAND</p>
        <div className="row">
          {handArray.map(function(card, index) { //for what it's worth, these variables dont matter
            return (
              <Card
                clickHandler={this.clickHandler}
                inHand={true} 
                keyname={'opp-hand-' + index}
                opponent={true}
              />
            );
          }, this)}
        </div>
      </div>
    );
  }

  renderPlayerHand() {
    const { hand } = this.state;

    return (
      <div className="container">
        <div className="row">
          {hand.map(function(card, index) { //okay these variables are more useful
            return (
              <Card 
                attack={card.attack}
                canAttack={false} //im assuming it's false anyway when it's in hand...
                clickHandler={this.clickHandler}
                cost={card.cost}
                index={index}
                keyname={"player-hand-" + index}
                inHand={true}
                health={card.health}
                title={card.title}
              />
            );
          }, this)}
        </div>
      </div>
    );
  }

  //gonna do this without max mana for now
  renderMana(player) {
    const mana = player == 'player' ? this.state.mana : this.state.opp_mana;
    const manaArray = [];
    //same conept with renderOppHand
    for(let i = 0; i < mana; i++) {
      manaArray.push("mana")
    }
    //the cards class should also put these side by side, but it might be better to have a special mana class
    return (
      <div className="container">
        <div className="row">
          {manaArray.map(function(mana, index) {
            return (
              <div className="mana-crystal-unspent" keyname={'mana-'+ index}></div>
            );
          }, this)}
        </div>
        <p className="mana-label">{mana}</p>
      </div>
    );
  }

  renderBattlefield(player) {
    const cards = player == 'player' ? this.state.minions : this.state.opp_minions;
    const keyPrefix = player == 'player' ?
      'player-battlefield-' :
      'enemy-battlefield-'
    return (
      <div className="container">
        <div className="row">
          {cards.map(function(card, index) {
            return (
              <Card
                attack={card.attack}
                canAttack={card.can_attack}
                click={this.clickHandler}
                health={card.health}
                index={index}
                inHand={false}
                keyname={keyPrefix + index}
                mana={card.cost}
                opponent={player == 'opponent' ? true : false}
                title={card.title}
              />
            );
          }, this)}
        </div>
      </div>
    );
  }

  makeFakeState() {
    //const {deck, hand, minions, health, opp_deck, opp_hand, opp_minions, opp_hand}
    this.state.opp_hand = 4;
    this.state.hand = [
      {id: 1, attack: 4, health: 4, cost: 3, can_attack: true, title: 'Totem'},
      {id: 2, attack: 1, health: 1, cost: 1, can_attack: true, title: 'Murloc'},
      {id: 3, attack: 15, health: 15, cost: 8, can_attack: true, title: 'JARRAXUS'},
    ];
    this.state.mana = 3;
    this.state.opp_mana = 4;
    this.state.health = 25;
    this.state.opp_health = 27;
    this.state.minions = [
      {id: 4, attack: 4, health: 5, cost: 7, can_attack: true, title: 'Sylvanas'},
      {id: 5, attack: 5, health: 5, cost: 5, can_attack: true, title: 'The Black Knight'},
      {id: 6, attack: 15, health: 15, cost: 1, can_attack: true, title: 'Innervate?'},
    ];

    this.state.opp_minions = [
      {id: 7, attack: 10, health: 10, cost: 7, can_attack: false, title: 'Big boi'},
    ];
  
    this.state.deck = 20;
    this.state.opp_deck = 21;
    //do specific cards later

  }

  render() {
    //console.log("rendering, current state:")
    this.makeFakeState()

    //console.log(this.state)
    return (
      <div>
        <div className="enemy-side">
          <div className="enemy-hand">
            {this.renderOppHand()}
          </div>
          <div className="player-stats">
            <div className="avatar">
              {this.renderPlayer('opponent')}
            </div>
            <div className="mana">
              {this.renderMana('opponent')}
            </div>
            <div className="deck">
              {this.renderDeck()}
            </div>
          </div>
          <div className="battlefield-opp">
            {this.renderBattlefield('opponent')}
          </div>
        </div>
        <div className="player-side">
          <div className="battlefield-player">
            {this.renderBattlefield('player')}
          </div>
          <div className="player-stats">
            <div className="avatar">
              {this.renderPlayer('player')}
            </div>
            <div className="mana">
              {this.renderMana('player')}
            </div>
            <div className="deck">
              {this.renderDeck()}
            </div>
          </div>
          <div className="player-hand">
            {this.renderPlayerHand()}
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
    this.handleClick = this.handleClick.bind(this)
    console.log("nice")
  }

  handleClick() {
    const { clickHandler, index, opponent } = this.props
    const location = inHand ? "hand" : "battlefield";
    clickHandler(location, index, opponent);
  }

  render() {
    const { id, attack, inHand, health, cost, title, canAttack, opponent, keyname } = this.props;
    
    if(opponent && inHand) {
      return (
        <div className="backwards-card">
        </div>
      );
    }
    
    //const className = inHand ? "card-in-hand" : "card-on-field";
    const className = "backwards-card";

    return (
      <div 
        className={className} 
        key={keyname}
        onClick={this.handleClick}>
        <h6>{title}</h6>
        <p>Attack: {attack}</p>
        <p>Health: {health}</p>
        <p>Cost: {cost}</p>
      </div>
    )
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
