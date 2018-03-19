defmodule HearthstoneWeb.CardView do
  use HearthstoneWeb, :view
  alias HearthstoneWeb.CardView

  def render("index.json", %{cards: cards}) do
    %{data: render_many(cards, CardView, "card.json")}
  end

  def render("show.json", %{card: card}) do
    %{data: render_one(card, CardView, "card.json")}
  end

  def render("card.json", %{card: card}) do
    %{id: card.id,
      title: card.title,
      attack: card.attack,
      health: card.health,
      cost: card.cost}
  end
end
