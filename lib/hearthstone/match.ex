defmodule Hearthstone.Match do 
  alias Hearthstone.Game

  def new() do
    # TODO: want this?
    cards = Game.list_cards()
    card_range = 1..length(cards)
    %{
      "turn_num" => 1,
      #player1_deck: Enum.take_random(card_range, 30),
      #player2_deck: Enum.take_random(card_range, 30),
      "player1" => new_player(card_range),
      "player2" => new_player(card_range)
    }
  end

  def new_player(card_range) do
    %{
      deck: Enum.take_random(card_range, 30),
      minions: [],
      health: 30,
      hand: [],
      mana: 1,
    }
  end

  # TODO: clean up with pipe operator
  def turn(game, player) do
    {deck, hand} = draw(game["#{player}"])
    
    player_state = game["#{player}"]
    |> Map.put(:mana, replenish_mana(game["turn_num"]))
    |> Map.put(:deck, deck)
    |> Map.put(:hand, hand)

    if player == "player2" do 
      Map.put(game, player, player_state)
      |> Map.put("turn_num", game["turn_num"] + 1)
    else 
      Map.put(game, player, player_state)
    end 
  end

  def replenish_mana(turn_num) when turn_num <= 10 do
    turn_num
  end

  def replenish_mana(turn_num), do: 10
  
  #TODO: should hand have a card map or just index
  def draw(player_state) do 
    if length(player_state.deck) > 0 do
      [head | tail] = player_state.deck
      {tail, player_state.hand ++ [head]}
    else 
      {player_state.deck, player_state.hand}
    end
  end

  def get_card(head) do
    card = Game.get_card(head)
    %{
      id: head,
      attack: card.attack,
      health: card.health,
    }    
  end

  #TODO
  def place(game, player, card_id) do 
    player_state = game["#{player}"]

    card = Game.get_card(card_id)

    if card.cost <= player_state.mana do
      updated_ps = Map.put(player_state, :mana, player_state.mana - card.cost)
      |> Map.put(:minions, player_state.minions ++ [card.id])
      |> Map.put(:hand, List.delete(player_state.hand, card.id)) 
      game = Map.put(game, player, updated_ps)
      {:ok, game}
    else
      {:error, game}
    end
  end

  #TODO: hardcoded player 2
  def attack_hero(game, player, card_id) do
    card = Game.get_card(card_id)
    if player == "player1" do 
      player_state = game["player2"] 
      |> Map.put(:health, game["player2"].health - card.attack)
      game = Map.put(game, "player2", player_state)
    else
      player_state = game["player1"]
      |> Map.put(:health, game["player1"].health - card.attack)
      game = Map.put(game, "player1", player_state)
    end
  end

  # Prototype by index of card in list
  # Something else 
  def attack_minion(game, player, card, o_card) do
    p1 = game["player1"]
    p2 = game["player2"]
    if player == "player1" do
      attack(p1, p2)
    else
      attack(p2, p1)
    end
  end

  def attack(att, rec) do
    
  end

  def opp_player("player1"), do: "player2"
  def opp_player("player2"), do: "player1"

  # TODO: Gameover? what keeps check 
  def gameover(game) do
    if game[:player2].health < 0 || game[:player1].health < 0 do
      true
    else 
      false
    end
  end

end

