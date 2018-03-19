defmodule Hearthstone.Game.Card do
  use Ecto.Schema
  import Ecto.Changeset


  schema "cards" do
    field :attack, :integer
    field :cost, :integer
    field :health, :integer
    field :title, :string

    timestamps()
  end

  @doc false
  def changeset(card, attrs) do
    card
    |> cast(attrs, [:title, :attack, :health, :cost])
    |> validate_required([:title, :attack, :health, :cost])
  end
end
