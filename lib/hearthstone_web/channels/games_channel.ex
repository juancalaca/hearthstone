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
        Backup.save_game(name, "player1")
        {:ok, %{"player" => "player1"}, assign(socket, :name, name)}
      else
        if game != "player1" do
          {:error, %{reason: "Game session full"}}
        else
          game = Match.new()
          Backup.save_game(name, game)
          socket = assign(socket, :name, name)
          Endpoint.broadcast "games:" <> name, "player1", %{"game" => Match.game_view(game, "player1")}
          {:ok, %{"player" => "player2", "game" => Match.game_view(game, "player2")}, socket}
        end
      end
    else
      {:error, %{reason: "unauthorized"}}
    end    
  end

  def handle_in("turn:" <> player, payload, socket) do
    game = Backup.get_game(socket.assigns[:name])
    game = Match.turn(game, player)
    Backup.save_game(socket.assigns[:name], game)
    Endpoint.broadcast "games:" <> socket.assigns[:name], Match.opp_player(player), %{"game" => Match.game_view(game, Match.opp_player(player))}
    {:ok, %{"game" => Match.game_view(game, player)}, socket}
  end

  def handle_in("place:" <> player, payload, socket) do 

  end

  def handle_in("attack_min:" <> player, payload, socket) do

  end

  def handle_in("attack_hero:" <> player, payload, socket) do

  end

  defp authorized?(params) do
    true
  end 
end
