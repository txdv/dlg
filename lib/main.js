var request = require('request'),
    jsdom   = require('jsdom'),
    cheerio = require('cheerio'),
    querystring = require('querystring'),
    smf         = require('./smf.js'),
    EventEmitter = require('events').EventEmitter,
    fs = require('fs');


exports.login = function (username, password, callback) {
  request({
    url: 'http://www.dotalicious-gaming.com/?action=login'
  } , function (error, response, body) {

    var regex = /.+var smf_iso_case_folding = (false|true).+/m;
    var folding = regex.exec(body)[1];

    regex = /.+var smf_charset = (.+);/m;
    smf.set(regex.exec(body)[1], folding);

    var patt = /.+hashLoginPassword\(this, '(.+)'\);/m;
    var cur_session_id = patt.exec(body)[1];

    hash = smf.hash(username, password, cur_session_id);

    var q = querystring.stringify({
      action: 'login2',
      user: username,
      passwrd: password,
      hash_passwrd: hash,
    });
    request({ url: 'http://www.dotalicious-gaming.com/?' + q }, callback);
  });
}

exports.requestreports = function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
  } else if (options === null || typeof options !== 'object') {
    options = { };
  }

  if (options.perlist === undefined) {
    options.perlist = 50;
  }

  if (options.list === undefined) {
    options.list = 0;
  }

  if (options.filter === undefined) {
    options.filter = 0;
  }

  options.action = 'dota';
  options.area = 'newreports';

  var query = querystring.stringify(options);

  request({
    url: "http://www.dotalicious-gaming.com/?" + query
  }, function (error, response, body) {
    jsdom.env({
      html: body,
      scripts: [ 'http://code.jquery.com/jquery-1.5.min.js' ]
    }, function (err, window) {
      var $ = window.jQuery;
      var table = $('table:eq(1)');
      function get($, line, row) {
        return table.find('tr:eq(' + line + ') td:eq(' + row + ')').text()
      }
      var info = [];
      for (var i = 1; i < $('table tr').length; i++) {
        info.push({
          id:       get($, i, 0),
          handled:  get($, i, 2),
          priority: get($, i, 3),
          reporter: get($, i, 4),
          // handle 5 (stats)
          reportee: get($, i, 6),
          // handle 7 (stats)
          title:    get($, i, 8),
          status:   get($, i, 9),
          // handle 10 (last active, user)
          href: $('table:eq(1) tr:eq(' + i + ') td:eq(10)').find('a').attr('href'),
        });
      }
      callback(info);
    });
  });
}

exports.runninggames = function(callback) {
  request({
    url: "http://www.dotalicious-gaming.com/?action=ajax;area=runninggames"
  }, function (error, response, body) {
    if (error) {
      callback(true);
      return;
    }
    var $ = cheerio.load(body);
    var info = [];
    var first = true;
    $('table tr').each(function (i, elem) {
      if (first) {
        first = false;
        return;
      }
      var that = $(this);
      function get(n) {
        return that.find('td').eq(n);
      };

      var tmp = get(1).text().split('\n');
      info.push({
        id: parseInt(tmp[0].substring('Game #'.length, tmp[0].length)),
        href: that.find('td').find('a').attr('href'),
        map: get(2).text(),
        mode: get(3).text(),
        skill: parseInt(get(5).text().substring(3, 4)),
        status: get(6).text(),
        time: get(7).text().trim(),
        server: {
          name: tmp[3],
          location: $(this).find('img').last().attr('title'),
        }
      });
    });
    callback(false, info);
  });
}

exports.GameWatcher = function(interval) {
  if (interval === undefined) {
    interval = 30;
  }

  var em = new EventEmitter();

  em.current = null;
  em.timer = null;
  em.running = false;

  function run() {
    em.timer = null;
    exports.runninggames(function (error, games) {
      if (error) {
        return;
      }
      games = games.collect(function (game) { return game.id; });
      var begun = games.select(function (g) { return !em.current.include(g); });
      if (begun.length > 0) {
        em.emit('bunchbegin', begun);
        begun.each(function (e) {
          em.emit('gamebegin', e);
        });
      }
      var finished = em.current.select(function (g) { return !games.include(g); });
      if (finished.length > 0) {
        em.emit('bunchend', finished);
        finished.each(function (e) {
          em.emit('gameend', e);
        });
      }
      em.current = games;
      em.timer = setTimeout(run, interval * 1000);
    });
  }

  em.start = function() {
    if (em.running) {
      return false;
    }
    em.running = true;

    exports.runninggames(function (error, games) {
      em.current = games.collect(function (game) { return game.id; });
      run();
    });
    return true;
  }

  em.stop = function () {
    if (!em.running) {
      return false;
    }
    em.running = false;

    if (em.timer !== null) {
      clearTimer(em.timer);
    }

    return true;
  }

  return em;
}

exports.replaylink = function (id) {
  if (typeof id !== 'string') {
    id = id.toString();
  }
  return 'http://replays.dotalicious-gaming.com/replays/' + id[0] + '/' + id[1] + '/' + id[2] + '/' + id[3] + '/' + id[4] + '/files/' + id + '.w3g';
}

exports.downloadreplay = function(id, callback) {
  var path = process.env.HOME + '/.config/dotalicious/' + id + '.w3g';
  fs.exists(path, function (exists) {
    if (exists) {
      callback(path);
      return;
    }
    var file = fs.createWriteStream(path);
    file.on('close', function () {
      callback(path);
    });
    request.get(exports.replaylink(id)).pipe(file);
  });
}
