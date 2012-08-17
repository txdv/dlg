var dlg = require('../../lib/main'),
    prototype = require('prototype'),
    irc = require('irc'),
    fs = require('fs');

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str) {
    return this.indexOf(str) == 0;
  };
}

var config = JSON.parse(fs.readFileSync('config.json'));

var running = null;

var client = new irc.Client(config.server, config.nick, { channels: config.channels });

config.channels.each(function (channel) {
  client.addListener('message' + channel, function (from, message) {
    if (message.startsWith('!running')) {
      client.say(channel, 'Currently running games: ' + running.length);
    }
  });
});

function event(games) {
  config.channels.each(function (channel) {
    client.say(channel, 'Games finished: ' + games);
  });
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
