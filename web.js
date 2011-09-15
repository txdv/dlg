var
    express = require('express'),
    io      = require('socket.io'),
    dlg     = require('./dlg'),

    app     = express.createServer();


app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.set('views', __dirname + '/views');
});

app.configure('development', function () {
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.set('view engine', 'jade');


app.listen(3000);

io = io.listen(app);

var txdv = 21799;
var aussie = 433;

app.get('/user/:id', function (req, res) {
  dlg.get(req.params.id, function (error, data) {
    if (error) {
      //throw new Error;
      res.end(JSON.stringify(error, null, 4));
      //return;
    }
    res.end(JSON.stringify(data, null, 4));
  });
});

