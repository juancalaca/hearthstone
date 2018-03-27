defmodule Hearthstone.Match do 
  alias Hearthstone.Game

  def new() do
    card_range = Game.get_indeces
    IO.puts "NEW"
    IO.puts card_range
    %{
      "player" => "player1",
      "turn_num" => 1,
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
      mana: 1
    }
  end

  # TODO: clean up with pipe operator
  def turn(game, player) do
    {deck, hand} = draw(game["#{player}"])
    
    player_state = game["#{player}"]
    |> Map.put(:minions, able_minions(game["#{player}"].minions))
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

  def able_minions(minions) do
    Enum.map(minions, fn (min) ->
        if min.can_attack do
          min
        else 
          Map.put(min, :can_attack, true)
        end
    end)
  end

  def replenish_mana(turn_num) when turn_num <= 10, do: turn_num
  def replenish_mana(turn_num), do: 10
  
  def draw(player_state) do 
    if length(player_state.deck) > 0 do
      [head | tail] = player_state.deck
      {tail, player_state.hand ++ [get_card(head)]}
    else 
      {player_state.deck, player_state.hand}
    end
  end

  def get_card(head) do
    card = Game.get_card(head)
    %{
      title: card.title,
      id: head,
      attack: card.attack,
      health: card.health,
      cost: card.cost,
      can_attack: false,
    }    
  end

  def place(game, player, card_index) do 
    player_state = game["#{player}"]

    card = Enum.at(player_state.hand, card_index)

    if card.cost <= player_state.mana do
      updated_ps = Map.put(player_state, :mana, player_state.mana - card.cost)
      |> Map.put(:minions, player_state.minions ++ [card])
      |> Map.put(:hand, List.delete(player_state.hand, card)) 
      game = Map.put(game, player, updated_ps)
      {:ok, game}
    else
      {:error, game}
    end
  end

  # TODO: CAN MINION ATTACK?
  def attack_hero(game, player, card_index) do
    card = Enum.at(game["#{player}"].minions, card_index)
    IO.inspect card
    if card.can_attack do 
      opp_state = Map.put(game["#{opp_player(player)}"], :health, game["#{opp_player(player)}"].health - card.attack)
      card = Map.put(card, :can_attack, false)
      player_state = game["#{player}"]
      player_state = Map.put(player_state, :minions, List.replace_at(player_state.minions, card_index, card))
      game = Map.put(game, player, player_state)
      |> Map.put(opp_player(player), opp_state)
      if gameover(game) do 
        {:gameover, game}
      else
        {:ok, game}
      end
    else 
      {:error, game}
    end
  end

  # Prototype by index of card in list
  # Something else 
  # TODO: CLEANup
  # TODO: Check if minion can attack
  # TODO: Where to check if minion can attack, front end or back end, or both?
  def attack_minion(game, player, card_ind, ocard_ind) do
    attacker = game["#{player}"] 
    if Enum.at(attacker.minions, card_ind).can_attack do
      #p1 = game["player1"]
      #p2 = game["player2"]
      #if player == "player1" do
      #  att = Enum.at(p1.minions, card_ind)
      #  rec = Enum.at(p2.minions, ocard_ind)
      #  {att, rec} = attack(att, rec)
      #  p1 = Map.put(p1, :minions, List.replace_at(p1.minions, card_ind, att))
      #  p2 = Map.put(p2, :minions, List.replace_at(p2.minions, ocard_ind, rec))
      #  Map.put(game, "player1", p1)
      #  |> Map.put("player2", p2)
      #else
      #  att = Enum.at(p2.minions, card_ind)
      #  rec = Enum.at(p1.minions, ocard_ind)
      #  {att, rec} = attack(att, rec)
      #  p1 = Map.put(p1, :minions, List.replace_at(p1.minions, ocard_ind, rec))
      #  p2 = Map.put(p2, :minions, List.replace_at(p2.minions, card_ind, att))
      #  Map.put(game, "player1", p1)
      #  |> Map.put("player2", p2)
      #  |> enforcer
      #end
      if player == "player1" do
        {:ok, can_attack(game, "player1", "player2", card_ind, ocard_ind)}
      else
        {:ok, can_attack(game, "player2", "player1", card_ind, ocard_ind)}
      end
    else 
      {:error, game}
    end
  end

  def can_attack(game, att_p, rec_p, card_ind, ocard_ind) do
    attacker = game["#{att_p}"]
    receiver = game["#{rec_p}"]
    att = Enum.at(attacker.minions, card_ind)
    rec = Enum.at(receiver.minions, ocard_ind)
    {att, rec} = attack(att, rec)
    att = Map.put(att, :can_attack, false)
    attacker = Map.put(attacker, :minions, List.replace_at(attacker.minions, card_ind, att))
    receiver = Map.put(receiver, :minions, List.replace_at(receiver.minions, ocard_ind, rec))
    Map.put(game, "#{att_p}", attacker)
    |> Map.put("#{rec_p}", receiver)
    |> enforcer
  end

  def attack(att, rec) do
    att_h = att.health - rec.attack
    rec_h = rec.health - att.attack
    {Map.put(att, :health, att_h) |> Map.put(:can_attack, false), Map.put(rec, :health, rec_h)}
  end

  def opp_player("player1"), do: "player2"
  def opp_player("player2"), do: "player1"

  # TODO: Gameover? what keeps check 
  def gameover(game) do
    game["player2"].health <= 0 || game["player1"].health <= 0
  end

  # Filters view appropriately for each player
  def game_view(game, player) do
    curr_p = game["#{player}"]
    opp_p = game["#{opp_player(player)}"]
    view = %{}
    |> Map.put(:player, game["player"])
    |> Map.put(:deck, length(curr_p.deck))
    |> Map.put(:opp_deck, length(opp_p.deck))
    |> Map.put(:hand, curr_p.hand)
    |> Map.put(:opp_hand, length(opp_p.hand))
    |> Map.put(:minions, owner(curr_p.minions, player))  #TODO: how to get rid of dead minions? here or before?
    |> Map.put(:opp_minions, owner(opp_p.minions, opp_player(player))) #TODO: only want id's or full map?
    |> Map.put(:mana, curr_p.mana)
    |> Map.put(:opp_mana, opp_p.mana)
    |> Map.put(:health, curr_p.health)
    |> Map.put(:opp_health, opp_p.health)
  end

  def owner(minions, player) do
    Enum.map(minions, fn (min) ->
      Map.put(min, :owner, player)
    end) 
  end

  def enforcer(game) do
    p1 = game["player1"]
    p2 = game["player2"]
    minions_p1 = get_alive(p1.minions)
    minions_p2 = get_alive(p2.minions)

    Map.put(game, "player1", Map.put(p1, :minions, minions_p1))
    |> Map.put("player2", Map.put(p2, :minions, minions_p2))

  end

  def get_alive(minions) do
    Enum.map(minions, fn (min) -> 
      if min.health > 0 do
        min
      else
        []
      end
    end)
    |> List.flatten
  end

  def end_turn(game) do
    Map.put(game, "player", opp_player(game["player"]))
  end
end

