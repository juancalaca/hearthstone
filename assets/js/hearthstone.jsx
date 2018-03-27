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
                .receive("error", resp => { this.errorAlert(resp.reason);
                                            window.location.href = "/";})
    
    this.channel.on("gameover", this.gameOver.bind(this));
    this.channel.on("update", this.update.bind(this));
    this.channel.on("start", this.startMatch.bind(this));
    this.channel.on("turnchange", this.turnChange.bind(this));
    this.cardClickHandler = this.cardClickHandler.bind(this);
    this.battlefieldClickHandler = this.battlefieldClickHandler.bind(this);
    this.faceClick = this.faceClick.bind(this);
    this.endTurn = this.endTurn.bind(this);
  }

  gameOver(resp) {
    let message;
    if (resp.game.health <= 0) {
      message = "You lost this match!";
    } else if (resp.game.opp_health <= 0) {
      message = "You won this match!";
    } else {
      message = "No more moves, match is done.";
    }
    this.errorAlert(message);
    window.location.href = "/";
  }

  turnChange(resp) {
    if (resp.game.player == window.player) {
      this.channel.push("turn", {})
    }
  }

  joinGame(resp) {
    if (resp.game) {
      window.player = resp.player;
      this.setState(resp.game);
    } else {
      window.player = resp.player;
    }
  }

  update(game) {
    const updated = game.game;
    console.log("updateeee?")
    console.log(updated)
    updated.selected = {};
    this.setState(updated);
  }

  startMatch(game) {
    this.setState(game.game);
    if (game.game.player == "player1") {
      this.channel.push("turn", {});
    }
  }

  errorAlert(msg) {
    alert(msg);
    this.setState({ selected: {} });
  }

  place() {
    const { selected } = this.state;
    this.channel.push("place", { card_index: selected.index })
      .receive("ok", this.update.bind(this))
      .receive("error", resp => { this.errorAlert(resp.reason) });
  }

  fight(minionIndex) {
    console.log("fighting")
    const { selected } = this.state;
    this.channel.push("attack_min", {card_ind: selected.index, ocard_ind: minionIndex })
      .receive("ok", this.update.bind(this))
      .receive("error", resp => { this.errorAlert(resp.reason) })
  }

  //if opponent = true, it belongs to the opponent
  cardClickHandler(location, index, opponent) {
    console.log("cardClickHandler")
    const { selected } = this.state;
    //if no card is selected and the selected card is an opponents
    if(Object.keys(selected).length === 0 && !opponent) {
      console.log("setting new selected card")
      //then this card becomes 'selected'
      const newSelected = { location, index };
      this.setState({ selected: newSelected });
      return;
    }
    if(selected.location == 'battlefield' && opponent 
      && location == 'battlefield')  {
      console.log("FIGHT")
      this.fight(index) //make sure those functions reset selected
      return;
    }
    console.log("unselecting from card")
    this.setState({ selected: {} });
    return;
    //hopefully this means literally anything other condition will
    //result in nothing happening. make sure to test it.
  }

  battlefieldClickHandler(player) {
    const { selected } = this.state;
    if(Object.keys(selected).length > 0  && selected.location == 'hand') {
      console.log("placing card")
      this.place()
    }
    else {
      // console.log("unselecting card from battlefield")
      //this.setState({ selected: {} });
    }
  }

  faceClick() {
    const { selected } = this.state;
    if(Object.keys(selected).length > 0 && selected.location == 'battlefield') {
      console.log("swinging at face")
      this.channel.push("attack_hero", { card_index: selected.index })
        .receive("ok", this.update.bind(this))
        .receive("gameover", resp => { alert("Game over! " + window.player + " has won.") })
        .receive("error", resp => { this.errorAlert(resp.reason) })
    }
    else {
      console.log("unselecting card from face")
      this.setState({ selected: {} });
    }
  }

  endTurn() {
    this.channel.push("endturn", {})
                .receive("error", resp => { this.errorAlert(resp.reason) })
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
                clickHandler={this.cardClickHandler}
                inHand={true} 
                keyname={'opp-hand-' + index}
                opponent={true}
                selectedCard={this.state.selected}
              />
            );
          }, this)}
        </div>
      </div>
    );
  }

  renderPlayerHand() {
    const { hand } = this.state;
    console.log("RENDERING PLAYE RHAND")
    console.log(this.clickHandler)
    return (
      <div className="container">
        <div className="row">
          {hand.map(function(card, index) { //okay these variables are more useful
            return (
              <Card 
                attack={card.attack}
                canAttack={false} //im assuming it's false anyway when it's in hand...
                clickHandler={this.cardClickHandler}
                cost={card.cost}
                index={index}
                keyname={"player-hand-" + index}
                inHand={true}
                health={card.health}
                opponent={false}
                selectedCard={this.state.selected}
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
                clickHandler={this.cardClickHandler}
                health={card.health}
                index={index}
                inHand={false}
                keyname={keyPrefix + index}
                mana={card.cost}
                opponent={player == 'opponent' ? true : false}
                selectedCard={this.state.selected}
                title={card.title}
              />
            );
          }, this)}
        </div>
      </div>
    );
  }

  renderEndTurnButton() {
    const colorClass = (window.player == this.state.player) ? 'green' : 'grey';
    return (
      <div 
        className={colorClass + " top-right"}
        onClick={this.endTurn}>
        <p>End turn</p>
      </div>
    )
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
    console.log("render, selected:")
    //this.makeFakeState();
    console.log(this.state)

    return (
      <div>
        <div className="enemy-side">
          <div className="enemy-hand">
            {this.renderOppHand()}
          </div>
          <div className="player-stats">
            <div 
              className="avatar"
              onClick={this.faceClick}>
              {this.renderPlayer('opponent')}
            </div>
            <div className="mana">
              {this.renderMana('opponent')}
            </div>
            <div className="deck">
              {this.renderDeck('opponent')}
            </div>
          </div>
          <div className="battlefield-opp">
            {this.renderBattlefield('opponent')}
          </div>
        </div>
        <div className="player-side">
          <div 
            className="battlefield-player"
            onClick={this.battlefieldClickHandler}>
            <div>
              {this.renderEndTurnButton()}>
            </div>
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
              {this.renderDeck('player')}
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
  }

  handleClick() {
    const { clickHandler, index, inHand, opponent } = this.props
    const location = inHand ? "hand" : "battlefield";
    clickHandler(location, index, opponent);
  }

  render() {
    const { attack, id, index, inHand, health, cost, title, canAttack, opponent, keyname, selectedCard } = this.props;
    let selected = selectedCard;
    if(Object.keys(selected).length === 0) {
      selected = {location: null, index: null}
    }

    //opponent's hand
    if(opponent && inHand) {
      return (
        <div className="backwards-card">
        </div>
      );
    }

    let className = opponent ? 'enemy-hover' : 'player-hover';
    //if this card matches the currently selected card, keep it outlined. matching the location gets a bit verbose but it works
    if(!opponent && index == selected.index && 
      (inHand && selected.location == "hand") || (!inHand && selected.location == "battlefield")) {
      className += ' selected';
    }
    //if it's in the player's hand
    if(!opponent && inHand) {
      className += ' card-in-hand';
      return (
        <div 
          className={className}
          key={keyname}
          onClick={this.handleClick}>
          <h6>{title}</h6>
          <p className="bottom-left attack">A: {attack}</p>
          <p className="bottom-right health">H: {health}</p>
          <p className="top-left cost">{cost}</p>
        </div>
      )
    }

    else {
      className += ' card-on-field';
      return (
        <div 
          className={className} 
          key={keyname}
          onClick={this.handleClick}>
          <h3 className="centered-letter text-center">{title.charAt(0)}</h3>
          <p className="bottom-left attack">{attack}</p>
          <p className="bottom-right health">{health}</p>
        </div>
      )
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
