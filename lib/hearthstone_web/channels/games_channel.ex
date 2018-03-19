defmodule HearthstoneWeb.GamesChannel do
  use HearthstoneWeb, :channel

  #TODO: handle waiting session
  def join("game:" <> name, payload, socket) do
    
  end

  def handle_in("turn:" <> player, payload, socket) do

  end

  def handle_in("place:" <> player, payload, socket) do 

  end

  def handle_in("attack_min:" <> player, payload, socket) do

  end

  def handle_in("attack_hero:" <> player, payload, socket) do

  end 
end
