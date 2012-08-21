var dlg = require('../../lib/main'),
    prototype = require('prototype'),
    irc = require('irc'),
    fs = require('fs'),
    http = require('http');

var config = JSON.parse(fs.readFileSync('config.json'));

var games = new dlg.GameWatcher();

var connections = [ ];

var server = http.createServer(function (req, res) {
  connections.push(res);
  res.on('close', function () {
    connections.splice(connections.indexOf(res), 1);
  });
});
server.listen(config.port);

var games = new dlg.GameWatcher();
games.on('gameend', function (id) {
  connections.each(function (e) {
    e.write(JSON.stringify({
      gameend: id,
    }) + '\r\n');
  });
});
games.on('gamebegin', function (id) {
  connections.each(function (e) {
    e.write(JSON.stringify({
      gamebegin: id
    }) + '\r\n');
  });
});

/*
var i = 0;
function run() {
  games.emit('gameend', i);
  i++;
  setTimeout(run, 1000);
}
run();
*/
games.start();

