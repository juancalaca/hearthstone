defmodule HearthstoneWeb.Router do
  use HearthstoneWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", HearthstoneWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    get "/add", PageController, :add
    get "/game/:game", PageController, :game
    get "/instructions", PageController, :instructions
    get "/layout", PageController, :layout
  end

  # Other scopes may use custom stacks.
  scope "/api/v1", HearthstoneWeb do
    pipe_through :api
    resources "/cards", CardController, except: [:new, :edit]
  end
end
