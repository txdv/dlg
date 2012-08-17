var dlg = require('./auth.js'),
    prototype = require('prototype'),
    irc = require('irc');

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str) {
    return this.indexOf(str) == 0;
  };
}

var running = null;

var client = new irc.Client('irc.freenode.org', 'afro-dlg', { channels: [ "#bletnx" ] });

client.addListener("message#bletnx", function (from, message) {
  if (message.startsWith('!running')) {
    client.say('#bletnx', "Currently running games: " + running.length);
  }
});

function event(games) {
  client.say('#bletnx', 'Games finished: ' + games);
}

function run() {
  dlg.runninggames(function (error, games) {
    if (error) {
      return;
    }
    games = games.collect(function (game) { return game.id; });
    var finished = games.select(function (g) { return !running.include(g); });
    if (finished.length > 0) {
      event(finished);
    }
    running = games;
    setTimeout(run, 30 * 1000);
  });
}

// initialize
dlg.runninggames(function (error, games) {
  running = games.collect(function (game) { return game.id; });
  run();
});

