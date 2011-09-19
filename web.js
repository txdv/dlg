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

function stringify(data) {
  return JSON.stringify(data, null, 4);
}

function countinc(id) {
  var countstring = '/count/' + id;
  client.get(countstring, function (error, key) {
    client.incrby(countstring, 1);
  });
};

function top(n, callback) {
  query = { by: '/count/*', order: 'desc', get: '/username/*' };

  if (typeof n !== 'function') {
    query.limit = [0, n];
  } else {
    callback = n;
  }

  client.sort('users', query, function (err, ret) {
    if (err) {
      callback(null);
    }

    for (var i = 0; i < ret.length; i++) {
      ret[i] = JSON.parse(ret[i]);
    }

    callback(ret);
  });
}

app.get('/top/:len', function (req, res) {
  var len = Math.max(parseInt(req.params.len), 100);
  top(Math.min(len, 10), function (ret) {
    res.send(stringify(ret, null, 4));
  });
});

app.get('/search/:substr', function (req, res) {
  var substrRegex = new RegExp(req.params.substr, 'i');
  top(function (ret) {
    var data = ret.filter(function (element) {
      return substrRegex.test(element.username);
    });
    res.send(stringify(data, null, 4));
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

function get(func, key, id, expire, callback) {
  key += id;
  client.get(key, function (error, value) {
    if (!value) {
      func(id, function (error, data) {
        client.set(key, stringify(data), function (error) {
          if (!error) {
            client.expire(key, expire);
          }
        });
        callback(null, data, true);
      });
    } else {
      callback(null, JSON.parse(value), false);
    }
  });
}

app.get('/user/:id', function (req, res) {
  get(dlg.profile, '/user/', req.params.id, 20 * 60, function (error, data, slow) {
    if (error) {
      return;
    }
    res.send(stringify(data));
    client.transaction(function () {
      countinc(req.params.id);
      client.sadd('users', req.params.id);
      if (slow) {
        client.set('/username/' + req.params.id, stringify({ username: data.username, id: req.params.id }));
      }
    });

  });
});

app.get('/achievements/:id', function(req, res) {
  get(dlg.achievements, '/achievements/', req.params.id, 20 * 60, function (error, data) {
    if (error) {
      return;
    }
    res.send(stringify(data));
  });
});

app.get('/', function (req, res) {
  res.render('index');
});
