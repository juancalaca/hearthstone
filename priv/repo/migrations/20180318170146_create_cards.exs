defmodule Hearthstone.Repo.Migrations.CreateCards do
  use Ecto.Migration

  def change do
    create table(:cards) do
      add :title, :string, null: false
      add :attack, :integer
      add :health, :integer
      add :cost, :integer, null: false

      timestamps()
    end

  end
end
