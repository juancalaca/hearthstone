# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :hearthstone,
  ecto_repos: [Hearthstone.Repo]

# Configures the endpoint
config :hearthstone, HearthstoneWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "OUJ+rryAiCF2lf3QXzUq7149WpEyWDBnzsR5oP8C41pMbjjaYTR4TBQc8zOaXLKE",
  render_errors: [view: HearthstoneWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Hearthstone.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
