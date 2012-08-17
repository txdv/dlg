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
var client = new irc.Client(config.server, config.nick, { channels: config.channels });

var games = new dlg.GameWatcher();

config.channels.each(function (channel) {
  client.addListener('message' + channel, function (from, message) {
    if (message.startsWith('!running')) {
      client.say(channel, 'Currently running games: ' + games.current.length);
    }
  });
});

games.on('bunchend', function (finished) {
  config.channels.each(function (channel) {
    client.say(channel, 'Games finished: ' + finished.join(', '));
  });
});

games.start();
