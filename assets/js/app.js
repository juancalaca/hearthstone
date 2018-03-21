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
  if ($('#add-card')) {
    console.log("New card");
    //$('#submit-card').click(add_card);
    add_card();
  }

  if ($('#root')) {
    let channel = socket.channel("games:" + window.gameName, {})
    channel.join()
      .receive("ok", resp => { window.player = resp.player; })
      .receive("error", resp => { console.log("Unable to join", resp); }) 
     //if (window.player == "player1") {
      channel.on("update", resp => { console.log(resp); }) 
      channel.on("start", resp => { console.log(resp); })
     //}

      $('#turn').click(function(ev) {
         channel.push("turn", {})
                .receive("error", resp => { console.log(resp); })
      })
  }
}

$(init);
