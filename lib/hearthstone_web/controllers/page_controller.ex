defmodule HearthstoneWeb.PageController do
  use HearthstoneWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def add(conn, _params) do 
    render conn, "add_card.html"
  end

  def game(conn, params) do
    render conn, "game.html", game: params["game"]
  end
end
