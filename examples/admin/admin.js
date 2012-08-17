var dlg = require('../../lib/main'),
    prototype = require('prototype'),
    fs = require('fs');

var config = JSON.parse(fs.readFileSync('config.json'));

dlg.login(config.username, config.password, function (error, response, body) {
  dlg.requestreports({ perlist: 5000 }, function (info) {
    info2 = info.select(function(e) { return e.title === 'flame'; })
    console.log(info.length + ' (' + info2.length + ')');
  });
});

