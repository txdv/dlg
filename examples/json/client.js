var dlg = require('../../lib/main'),
    dotaparser = require('../../../dotaparser/main.js'),
    JSONStream = require('JSONStream'),
    request = require('request'),
    irc = require('irc'),
    fs = require('fs');

var config = JSON.parse(fs.readFileSync('config.json'));
var ircconfig = JSON.parse(fs.readFileSync('../ircbot/config.json'));
var client = new irc.Client(ircconfig.server, ircconfig.nick, { channels: ircconfig.channels });

var stream = JSONStream.parse(['gameend']),
    req = request({ url: config.host + ':' + config.port });

req.pipe(stream);

counter = { };

stream.on('data', function (id) {
  dlg.downloadreplay(id, function (path) {
    dotaparser.replay3(path, function (game, event) {
      switch (event.type) {
      case 'chat':
        if (event.text.search('noob') === -1) {
          return;
        }

        if (counter[event.player.name] === undefined) {
          counter[event.player.name] = 1;
        } else {
          counter[event.player.name]++;
        }
      default:
        return;
      }
    }, function () {
      console.log(counter);
    });
  });
});
