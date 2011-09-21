var
    request    = require('request'),
    sys        = require('sys'),
    jsdom      = require('jsdom');


// some useful stuff

function trim(text) {
  return text.replace(/^\s+|\s+$/g,"");
}

function rtrim(text) {
  return text.replace(/\s+$/,"");
}

function element(de, element1, line, element2, row) {
  return de.find(element1 + ':eq(' + line + ')').find(element2 + ':eq(' + row + ')').text();
}

function e(e, line, row) {
  return element(e, 'tr', line, 'td', row);
}

function i(i, line, row) {
  return parseInt(e(i, line, row));
}

function f(f, line, row) {
  return parseFloat(e(f, line, row));
}

function de(de, line, row) {
  return element(de, 'dl', line, 'dd', row);
}

// the main stats retrieval function

exports.profile = function (id, callback) {

  var data = { id: parseInt(id) };

  var url = 'http://www.dotalicious-gaming.com/index.php?action=profile;u=' + id;

  request({ uri: url }, function (error, response, body) {
    if (error && response.statusCode !== 200) {
      callback(true);
    }

    jsdom.env({
      html: body,
      scripts: [ 'http://code.jquery.com/jquery-1.5.min.js' ]
    }, function (err, window) {
      try {
      var $ = window.jQuery;

      var c1 = $('.content');

      username = c1.find('.username').find('h4');
      data.username = username.text().split(' ', 1)[0];
      data.position = username.find('span').html();
      data.avatar   = c1.find('img.avatar').attr('src');
      data.status   = c1.find('#userstatus').find('img').attr('alt');

      var c2 = $('.content:eq(1)').find('table:eq(1)');

      var clan = e(c2, 2, 0);
      var o = 0;
      if (clan === 'Clan:') {
        data.clan = e(c2, 2, 1);
        o++;
      } else {
        data.clan = null;
      }

      data.vouched = trim(e(c2, o + 2, 1)) !== 'no';

      data.games = {
        'played'  : i(c2, o + 3, 1),
        'won'     : i(c2, o + 4, 1),
        'left'    : i(c2, o + 5, 1),
        'ditches' : i(c2, o + 6, 1),
      };

      data.score = f(c2, o + 7, 1);
      data.sl    = i(c2, o + 8, 1);
      data.rank  = i(c2, o + 9, 1);
      data.reliability = f(c2, o + 10, 1);

      data.hero = {
        'kills'  : i(c2, o + 13, 1),
        'kpm'    : f(c2, o + 14, 1),
        'deaths' : i(c2, o + 15, 1),
        'assists': i(c2, o + 16, 1)
      }

      data.other = {
        'longestwinstreak' : i(c2, o + 19, 1),
        'currentwinstreak' : i(c2, o + 20, 1),
        'creepskilled'     : i(c2, o + 21, 1),
        'creepsdenied'     : i(c2, o + 22, 1),
        'neutralskilled'   : i(c2, o + 23, 1),
        'towersdestroyed'  : i(c2, o + 24, 1),
        'raxsdestroyed'    : i(c2, o + 25, 1),
        'lvl6after'        : f(c2, o + 26, 1),
        'lvl11after'       : f(c2, o + 27, 1),
        'courierskilled'   : i(c2, o + 28, 1),
        'couriersshared'   : i(c2, o + 29, 1),
        'totaltime'        : rtrim(e(c2, o + 30, 1)),
        'heroesplayed'     : e(c2, o + 31, 1),
        'statsresets'      : i(c2, o + 32, 1)
      }

      // for some reason this returns null with my account on nodejs
      var c3 = $('.content:eq(2)');

      var posts = de(c3, 0, 0);
      data.posts = parseInt(posts.split(' ', 1)[0]);

      var posts_per_day = posts.split(' ')[1];
      posts_per_day = posts_per_day.substring(1, posts_per_day.length - 1);
      posts_per_day = parseFloat(posts_per_day);

      data.postsperday = posts_per_day;

      var personaltext = element(c3, 'dl', 0, 'dt', 1);

      o = 0;
      if (personaltext === 'Personal Text:') {
        data.personaltext = de(c3, 0, 1);
        o++;
      } else {
        data.personaltext = null;
      }

      data.karma = de(c3, 0, o + 1);
      data.refferals = parseInt(trim(de(c3, 0, 2)));

      data.age = trim(de(c3, 0, 5));
      if (data.age == '') {
        data.age = null;
      }

      data.date = {
        'registered': de(c3, 1, o + 0),
        'localtime' : de(c3, 1, o + 1),
        'lastactive': de(c3, 1, o + 2)
      };

      var prefix = '<h5>Signature:</h5>\n\t\t\t\n';

      data.signature = trim($('.signature').html());
      data.signature = data.signature.substring(prefix.length, data.signature.length);

      var pen = $('table:eq(0)').find('table:eq(0)').find('table:eq(2)');
      var first = true;
      var penalties = [];
      pen.find('tr').each(function(id) {
        if (first) {
          first = false;
        } else {
          var amount = $(this).find('td:eq(0)').text().split(' of ');
          var reason = $(this).find('td:eq(1)').text();
          var gameid = $(this).find('td:eq(2)').text().split(' in Game #');

          penalties.push({
            pp: {
              current: parseFloat(amount[0]),
              total: parseInt(amount[1])
            },
            reason: reason,
            gameid: parseInt(gameid[1]),
            date:  gameid[0]
          });
        }
      });

      data.penalties = penalties;

      callback(null, data);

      } catch (err) {
        callback(err, null);
      }
    });
  });
}

var removeHtml = new RegExp("s/<(.*?)>//g");

function getInfo(rawText) {
  var info = rawText.split('<br>').map(function(e) { return trim(e); });
  var awarded = info[0].replace(/<.*?>/g, ''),
      nextlvl = info[1].replace(/<.*?>/g, ''),
      current = info[2].split('</i>')[1];
  return {
    awarded: awarded.substr('Awarded: '.length, awarded.length),
    nextlvl: nextlvl.substr('Next level: '.length, nextlvl.length),
    current: trim(current)
  };
};

exports.achievements = function (id, callback) {
  var url = 'http://www.dotalicious-gaming.com/index.php?action=dota;area=achievements&user=' + id;

  request({ uri: url }, function (error, response, body) {
    if (error && response.statusCode !== 200) {
      callback(true);
    }

    jsdom.env({
      html: body,
      scripts: [ 'http://code.jquery.com/jquery-1.5.min.js' ]
    }, function (err, window) {
      var $ = window.jQuery;
      var achievements = [];
      $('.achievement').each(function (id) {
        var a = $(this);
        console.log();
        achievements.push({
          name:         a.find('.header').text(),
          description:  a.find('.description').text(),
          image:        a.find('img:first').attr('src'),
          info: getInfo(a.find('.info').html())
        });
      });
      callback(null, achievements);
    });
  });
}

exports.heroes = function (id, callback) {
  var url = 'http://www.dotalicious-gaming.com/index.php?action=dota;area=heroes&user=' + id;
  request({ uri: url }, function (error, response, body) {
    if (error && response.statusCode !== 200) {
      callback(true);
    }
    jsdom.env({
      html: body,
      scripts: [ 'http://code.jquery.com/jquery-1.5.min.js' ]
    }, function (err, window) {
      var $ = window.jQuery;
      var heroes = [ ];
      $('table.herotds').each(function () {
        var e = $(this);
        e.find('img').each(function () {
          var i = $(this);
          var title = i.attr('title');
          var s = title.split(': ');
          var s1 = s[0].split(', the ');

          var t = s[1].split('%), ');
          var t1 = t[0].split(' times played (');
          var t2 = t[1].substr(0, t[1].length - 2).split(' times won (');

          heroes.push({
            nick: s1[0],
            name: s1[1],
            played   : parseInt(  t1[0]),
            playedpct: parseFloat(t1[1]),
            won      : parseInt(  t2[0]),
            wonpct   : parseFloat(t2[1])
          });
        });
      });
      callback(null, heroes);
    });
  });
}
