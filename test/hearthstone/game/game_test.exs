defmodule Hearthstone.GameTest do
  use Hearthstone.DataCase

  alias Hearthstone.Game

  describe "cards" do
    alias Hearthstone.Game.Card

    @valid_attrs %{attack: 42, cost: 42, health: 42, title: "some title"}
    @update_attrs %{attack: 43, cost: 43, health: 43, title: "some updated title"}
    @invalid_attrs %{attack: nil, cost: nil, health: nil, title: nil}

    def card_fixture(attrs \\ %{}) do
      {:ok, card} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Game.create_card()

      card
    end

    test "list_cards/0 returns all cards" do
      card = card_fixture()
      assert Game.list_cards() == [card]
    end

    test "get_card!/1 returns the card with given id" do
      card = card_fixture()
      assert Game.get_card!(card.id) == card
    end

    test "create_card/1 with valid data creates a card" do
      assert {:ok, %Card{} = card} = Game.create_card(@valid_attrs)
      assert card.attack == 42
      assert card.cost == 42
      assert card.health == 42
      assert card.title == "some title"
    end

    test "create_card/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Game.create_card(@invalid_attrs)
    end

    test "update_card/2 with valid data updates the card" do
      card = card_fixture()
      assert {:ok, card} = Game.update_card(card, @update_attrs)
      assert %Card{} = card
      assert card.attack == 43
      assert card.cost == 43
      assert card.health == 43
      assert card.title == "some updated title"
    end

    test "update_card/2 with invalid data returns error changeset" do
      card = card_fixture()
      assert {:error, %Ecto.Changeset{}} = Game.update_card(card, @invalid_attrs)
      assert card == Game.get_card!(card.id)
    end

    test "delete_card/1 deletes the card" do
      card = card_fixture()
      assert {:ok, %Card{}} = Game.delete_card(card)
      assert_raise Ecto.NoResultsError, fn -> Game.get_card!(card.id) end
    end

    test "change_card/1 returns a card changeset" do
      card = card_fixture()
      assert %Ecto.Changeset{} = Game.change_card(card)
    end
  end
end
