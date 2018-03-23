// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import socket from "./socket"
import run_hearthstone from "./hearthstone"

import $ from "jquery";

function add_card() {
  $('#add-card').submit(function(ev) {
    ev.preventDefault();

    var title = $('#card-title').val();
    var attack = $('#card-attack').val();
    var health = $('#card-health').val();
    var cost = $('#card-cost').val();

    var new_card = JSON.stringify({
      card: {
        title: title,
        attack: attack,
        health: health,
        cost: cost
      },
    });

    $.ajax("/api/v1/cards", {
      method: "post",
      dataType: "text",
      //data: new_card,
      contentType: "application/json; charset=UTF-8",
      data: new_card,
      success: (succ) => { console.log(succ); },
      error: (err) => { console.log(err); },
    });

  });
}

function init() {
  console.log("initing")

  let add_card = document.getElementById("add-card");
  if (add_card) {
    console.log("New card");
    //$('#submit-card').click(add_card);
    add_card();
  }

  let root = document.getElementById("root");
  if (root) {
    let channel = socket.channel("games:" + window.gameName, {})

    run_hearthstone(root, channel);

    // channel.join()
    //   .receive("ok", resp => { window.player = resp.player; if(resp.game) game = resp.game; })
    //   .receive("error", resp => { console.log("Unable to join", resp); })
    //
    //   let game = null;
    //   channel.on("update", resp => { game = resp.game; console.log(resp.game) })
    //   channel.on("start", resp => { game = resp.game; console.log(game)})

      $('#turn').click(function(ev) {
         channel.push("turn", {})
                .receive("error", resp => { console.log(resp); })
      })

      $('#endturn').click(function(ev) {
          channel.push("endturn", {})
                 .receive("error", resp => { console.log(resp); })
      })

      //if (game) {
      //document.getElementById("display").innerHTML = "<ul><li>Player: " + window.player + "</li><li>Turn: " + game.player + "</li><li>Deck: " + game.deck + "</li>";
      //}
     $('#place').submit(function(ev) {
       ev.preventDefault();
       var card_index = $('#place-min').val();

       channel.push("place", {card_index: parseInt(card_index)})
              .receive("error", resp => {window.alert(resp.reason)});
     });

    $('#attack-min').submit(function(ev) {
      ev.preventDefault();
      var att_ind = $('#attacker-min').val()
      var rec_ind = $('#rec-min').val()

      channel.push("attack_min", {card_ind: parseInt(att_ind), ocard_ind: parseInt(rec_ind)})
             .receive("error", resp => {window.alert(resp.reason)})
    })
  
    $('#attack-hero').submit(function(ev) {
      ev.preventDefault()

      var id = $('#attacker').val()

      channel.push("attack_hero", {card_index: parseInt(id)})
             .receive("error", resp => {window.alert(resp.reason)})
    })

  }
}

$(init);
