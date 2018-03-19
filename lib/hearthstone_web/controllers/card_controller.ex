defmodule HearthstoneWeb.CardController do
  use HearthstoneWeb, :controller

  alias Hearthstone.Game
  alias Hearthstone.Game.Card

  action_fallback HearthstoneWeb.FallbackController

  def index(conn, _params) do
    cards = Game.list_cards()
    render(conn, "index.json", cards: cards)
  end

  def create(conn, %{"card" => card_params}) do
    with {:ok, %Card{} = card} <- Game.create_card(card_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", card_path(conn, :show, card))
      |> render("show.json", card: card)
    end
  end

  def show(conn, %{"id" => id}) do
    card = Game.get_card!(id)
    render(conn, "show.json", card: card)
  end

  def update(conn, %{"id" => id, "card" => card_params}) do
    card = Game.get_card!(id)

    with {:ok, %Card{} = card} <- Game.update_card(card, card_params) do
      render(conn, "show.json", card: card)
    end
  end

  def delete(conn, %{"id" => id}) do
    card = Game.get_card!(id)
    with {:ok, %Card{}} <- Game.delete_card(card) do
      send_resp(conn, :no_content, "")
    end
  end
end
