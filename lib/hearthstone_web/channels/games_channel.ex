defmodule HearthstoneWeb.GamesChannel do
  use HearthstoneWeb, :channel
  alias Hearthstone.Match
  alias HearthstoneWeb.Backup
  alias HearthstoneWeb.Endpoint

  #TODO: handle waiting session
  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = Backup.get_game(name)
      if game == nil do
        socket = assign(socket, :player, "player1")
        Backup.save_game(name, "player1")
        {:ok, %{"player" => "player1"}, assign(socket, :name, name)}
      else
        if game != "player1" do
          {:error, %{reason: "Game session full"}}
        else
          game = Match.new()
          Backup.save_game(name, game)
          socket = assign(socket, :name, name)
          |> assign(:player, "player2")
          Endpoint.broadcast "games:" <> name, "start", %{"game" => Match.game_view(game, "player1")}
          {:ok, %{"player" => "player2", "game" => Match.game_view(game, "player2")}, socket}
        end
      end
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("turn", payload, socket) do
    game = Backup.get_game(socket.assigns[:name])
    game = Match.turn(game, socket.assigns[:player])
    Backup.save_game(socket.assigns[:name], game)
    broadcast! socket, "update", %{"game" => game}
    {:noreply, socket}
  end

  def handle_in("place", %{"card_index" => card_index}, socket) do
    game = Backup.get_game(socket.assigns[:name])
    if Match.check_turn(game, socket.assigns[:player]) do
      case Match.place(game, socket.assigns[:player], card_index) do
        {:ok, game} ->
          Backup.save_game(socket.assigns[:name], game)
          broadcast! socket, "update", %{"game" => game}
          {:noreply, socket}
        {:mana, _} ->
          {:reply, {:error, %{reason: "Not enough mana to place card, try again."}}, socket}
        {:minions, _} ->
          {:reply, {:error, %{reason: "Can only have 7 minions in battlefield."}}, socket}
      end
    else
      {:reply, {:error, %{reason: "Not your turn."}}, socket}
    end
  end

  def handle_in("attack_min", %{"card_ind" => card_ind, "ocard_ind" => ocard_ind}, socket) do
    game = Backup.get_game(socket.assigns[:name])
    if Match.check_turn(game, socket.assigns[:player]) do
      case Match.attack_minion(game, socket.assigns[:player], card_ind, ocard_ind) do
        {:ok, game} ->
          Backup.save_game(socket.assigns[:name], game)
          broadcast! socket, "update", %{"game" => game}
          {:noreply, socket}
        {:error, _} ->
          {:reply, {:error, %{reason: "Minion cannot attack in this turn, please try again."}}, socket}
      end
    else
      {:reply, {:error, %{reason: "Not your turn."}}, socket}
    end
  end

  def handle_in("attack_hero", %{"card_index" => card_index}, socket) do
    game = Backup.get_game(socket.assigns[:name])
    if Match.check_turn(game, socket.assigns[:player]) do
      case Match.attack_hero(game, socket.assigns[:player], card_index) do
        {:ok, game} ->
          Backup.save_game(socket.assigns[:name], game)
          broadcast! socket, "update", %{"game" => game}
          {:noreply, socket}
        {:gameover, game} ->
          Backup.save_game(socket.assigns[:name], nil)
          broadcast! socket, "gameover", %{"game" => game}
          {:noreply, socket}
        {:error, _} ->
          {:reply, {:error, %{reason: "Minion cannot attack in this turn, please try again."}}, socket}
      end
    else
      {:reply, {:error, %{reason: "Not your turn."}}, socket}
    end
  end

  def handle_in("endturn", payload, socket) do
    if Match.check_turn(Backup.get_game(socket.assigns[:name]), socket.assigns[:player]) do
      game = Backup.get_game(socket.assigns[:name])
      |> Match.end_turn
      Backup.save_game(socket.assigns[:name], game)
      broadcast! socket, "turnchange", %{"game" => game}
      {:noreply, socket}
    else
      {:reply, {:error, %{reason: "Not your turn."}}, socket}
    end
  end


  intercept ["update", "turnchange"]

  def handle_out("update", payload, socket) do
    payload = Map.put(payload, :game, Match.game_view(payload["game"], socket.assigns[:player]))
    push socket, "update", payload
    {:noreply, socket}
  end

  def handle_out("turnchange", payload, socket) do
    payload = Map.put(payload, :game, Match.game_view(payload["game"], socket.assigns[:player]))
    push socket, "turnchange", payload
    {:noreply, socket}
  end

  defp authorized?(params) do
    true
  end
end
