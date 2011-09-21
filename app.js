var dlg = require('./dlg'),
    sys = require('sys');

String.prototype.startsWith = function (str){
  return this.indexOf(str) == 0;
};

var func = dlg.profile;

var a = process.argv[2];

if ('achievements'.startsWith(a)) {
  func = dlg.achievements;
} else if ('heroes'.startsWith(a)) {
  func = dlg.heroes;
}

func(process.argv[3], function (error, data) {
  if (error) {
    sys.puts('couldn\'t fetch the stuff');
    return;
  }
  sys.puts(JSON.stringify(data, null, 4));
});
