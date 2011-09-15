var dlg = require('./dlg'),
    sys = require('sys');

dlg.get(process.argv[2], function (error, data) {
  if (error) {
    sys.puts('couldn\'t fetch the stuff');
    return;
  }
  sys.puts(JSON.stringify(data, null, 4));
});
