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
    const { selected } = this.state;
    this.channel.push("attack_min", {card_ind: selected.index, ocard_ind: minionIndex })
      .receive("ok", this.update.bind(this))
      .receive("error", resp => { this.errorAlert(resp.reason) })
  }

  //if opponent = true, it belongs to the opponent
  cardClickHandler(location, index, opponent) {
    const { selected } = this.state;
    //if no card is selected and the selected card is an opponents
    if(Object.keys(selected).length === 0 && !opponent) {
      //then this card becomes 'selected'
      const newSelected = { location, index };
      this.setState({ selected: newSelected });
      return;
    }
    if(selected.location == 'battlefield' && opponent
      && location == 'battlefield')  {
      this.fight(index)
      return;
    }
    this.setState({ selected: {} });
    return;
  }

  battlefieldClickHandler(player) {
    const { selected } = this.state;
    if(Object.keys(selected).length > 0  && selected.location == 'hand') {
      this.place()
    }
  }

  faceClick() {
    const { selected } = this.state;
    if(Object.keys(selected).length > 0 && selected.location == 'battlefield') {
      this.channel.push("attack_hero", { card_index: selected.index })
        .receive("ok", this.update.bind(this))
        .receive("error", resp => { this.errorAlert(resp.reason) })
    }
    else {
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
          Deck: {deckSize}
        </p>
      </div>
    );
  }

  renderPlayer(player) {
    let className;
    const playerName = window.player;
    if(player == 'player' && playerName == 'player1') {
      className = 'jaina';
    }
    else if(player == 'player' && playerName == 'player2') {
      className = 'GARROSH';
    }
    else if(player == 'opponent' && playerName == 'player1') {
      className = 'GARROSH enemy-hover';
    }
    if(player == 'opponent' && playerName == 'player2') {
      className = 'jaina enemy-hover';
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
    for(let i = 0; i < size; i ++) {
      handArray.push("card")
    }
    return (
      <div className="container">
        <div className="row">
          {handArray.map(function(card, index) {
            return (
              <Card
                clickHandler={this.cardClickHandler}
                inHand={true}
                key={'opp-hand-' + index}
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
    return (
      <div className="container">
        <div className="row">
          {hand.map(function(card, index) {
            return (
              <Card
                attack={card.attack}
                canAttack={false}
                clickHandler={this.cardClickHandler}
                cost={card.cost}
                index={index}
                key={"player-hand-" + index}
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
              <div className="mana-crystal-unspent" key={'mana-'+ index}></div>
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
                key={keyPrefix + index}
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
    const colorClass = (window.player == this.state.player) ? 'green smaller-player-hover' : 'grey';

    return (
      <div
        className={colorClass + " top-right end-turn"}
        onClick={this.endTurn}>
        <h6 className="text-center">End turn</h6>
      </div>
    )
  }

  render() {

    //a really specifically placed workaround to ensure that the player's battlefield only lights up on hover if
    //there is a currently selected card from their hand. this is what happens when i fix things this far into the process
    let playerBattlefieldClassName = 'battlefield-player';
    const { selected } = this.state;
    if(Object.keys(selected).length > 0 && selected.location == 'hand') {
      playerBattlefieldClassName += ' smaller-player-hover';
    }
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
            className={playerBattlefieldClassName}
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
  }
}

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
    const { attack, id, index, inHand, health, cost, title, canAttack, opponent, selectedCard } = this.props;
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
      ((inHand && selected.location == "hand") || (!inHand && selected.location == "battlefield"))) {
      className += ' selected';
    }
    //if it's in the player's hand
    if(!opponent && inHand) {
      className += ' card-in-hand';
      return (
        <div
          className={className}
          onClick={this.handleClick}>
          <h6 className="centered-letter text-center">{title}</h6>
          <h6 className="bottom-left attack">{attack}</h6>
          <h6 className="bottom-right health">{health}</h6>
          <h6 className="top-left cost">{cost}</h6>
        </div>
      )
    }

    else {
      className += ' card-on-field';
      if(canAttack && opponent) {
        className += ' opponent-can-attack';
      }
      if(canAttack && !opponent) {
        className += ' player-can-attack';
      }
      return (
        <div
          className={className}
          onClick={this.handleClick}>
          <h4 className="centered-letter text-center">{title.substring(0, 3) + "."}</h4>
          <h6 className="bottom-left attack">{attack}</h6>
          <h6 className="bottom-right health">{health}</h6>
        </div>
      )
    }
  }
}
