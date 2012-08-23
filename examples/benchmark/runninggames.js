var dlg = require('../../lib/main.js');

var start = Date.now();

dlg.runninggames(function (error, info) {
  var end = Date.now();
  console.log(end - start);
});
