defmodule HearthstoneWeb.CardControllerTest do
  use HearthstoneWeb.ConnCase

  alias Hearthstone.Game
  alias Hearthstone.Game.Card

  @create_attrs %{attack: 42, cost: 42, health: 42, title: "some title"}
  @update_attrs %{attack: 43, cost: 43, health: 43, title: "some updated title"}
  @invalid_attrs %{attack: nil, cost: nil, health: nil, title: nil}

  def fixture(:card) do
    {:ok, card} = Game.create_card(@create_attrs)
    card
  end

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all cards", %{conn: conn} do
      conn = get conn, card_path(conn, :index)
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create card" do
    test "renders card when data is valid", %{conn: conn} do
      conn = post conn, card_path(conn, :create), card: @create_attrs
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get conn, card_path(conn, :show, id)
      assert json_response(conn, 200)["data"] == %{
        "id" => id,
        "attack" => 42,
        "cost" => 42,
        "health" => 42,
        "title" => "some title"}
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, card_path(conn, :create), card: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update card" do
    setup [:create_card]

    test "renders card when data is valid", %{conn: conn, card: %Card{id: id} = card} do
      conn = put conn, card_path(conn, :update, card), card: @update_attrs
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get conn, card_path(conn, :show, id)
      assert json_response(conn, 200)["data"] == %{
        "id" => id,
        "attack" => 43,
        "cost" => 43,
        "health" => 43,
        "title" => "some updated title"}
    end

    test "renders errors when data is invalid", %{conn: conn, card: card} do
      conn = put conn, card_path(conn, :update, card), card: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete card" do
    setup [:create_card]

    test "deletes chosen card", %{conn: conn, card: card} do
      conn = delete conn, card_path(conn, :delete, card)
      assert response(conn, 204)
      assert_error_sent 404, fn ->
        get conn, card_path(conn, :show, card)
      end
    end
  end

  defp create_card(_) do
    card = fixture(:card)
    {:ok, card: card}
  end
end
