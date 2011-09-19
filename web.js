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

function countinc(id) {
  var countstring = '/count/' + id;
  client.get(countstring, function (error, key) {
    client.incrby(countstring, 1);
  });
};

app.get('/top/:len', function (req, res) {
  var len = Math.max(req.params.len, 100);
  len = Math.min(len, 10);
  client.sort('users', { by: '/count/*', order: 'desc', limit: [0, len], get: '/username/*' }, function (err, ret) {
    for (var i = 0; i < ret.length; i++) {
      ret[i] = JSON.parse(ret[i]);
    }
    res.send(JSON.stringify(ret, null, 4));
  });
});


function getUsername(id) {
  client.get('/username/' + id, function (error, key) {
    if (error) {
      return null;
    }
    try {
      return JSON.jsonify(key);
    } catch (e) {
      return null;
    }
  });
}


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

        client.transaction(function () {
          countinc(req.params.id);
          client.set('/username/' + req.params.id, JSON.stringify({ username: data.username, id: req.params.id }));
          client.sadd('users', req.params.id);
        });

      });
    } else {
      res.end(key);
      countinc(req.params.id);
    }
  });
});


app.get('/', function (req, res) {
  res.render('index');
});
