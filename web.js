var
    express = require('express'),
    io      = require('socket.io'),
    dlg     = require('./dlg'),
    redis   = require('redis-node'),

    app     = express.createServer(),
    client  = redis.createClient();


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

app.get('/user/:id', function (req, res) {
  var userstring = '/user/' + req.params.id;
  client.get(userstring, function (error, key) {
    if (!key) {
      dlg.get(req.params.id, function (error, data) {
        key = JSON.stringify(data, null, 4);
        client.set(userstring, key, function (error) {
          if (!error) {
            client.expire(userstring, 5 * 60);
          }
        });
        res.end(key);
      });
    } else {
      res.end(key);
    }
  });
});


app.get('/', function (req, res) {
  res.render('index');
});
