var socket = io.connect('/index');

function get(id, callback) {
  $.get('/user/' + id, function (data) {
    callback(JSON.parse(data));
  });
}

function top(len, callback) {
  $.get('/top/' + len, function (data) {
    callback(JSON.parse(data));
  });
}

function text(line, row) {
  if (typeof(line === 'string')) {
    return $('#info').find('#' + line).find('td:eq(' + row + ')');
  } else {
    return $('#info').find('tr:eq(' + line + ')').find('td:eq(' + row + ')');
  }
}

function updateInfo(row, data) {
  text('name'  , row).text(data.username);
  text('avatar', row).find('img').attr('src', data.avatar);
  text('vouch' , row).text((data.vouched ? 'yes' : 'no'));

  text('games' , row).text(data.games.played);
  text('won'   , row).text(data.games.won);
  text('left'  , row).text(data.games.left);

  var winpct = Math.floor((data.games.won / data.games.played) * 10000)/100;
  text('winpct',  row).text(winpct + '%');

  var leavepct = Math.floor((data.games.left / data.games.played)*10000)/100;
  text('leave', row).text(leavepct + '%');

  text('kills',   row).text(data.hero.kills);
  text('deaths',  row).text(data.hero.deaths);
  text('assists', row).text(data.hero.assists);
}

function form(formid, row) {
  $('#p' + formid).submit(function (event) {
    var id = $('#id' + formid).val();
    get(id, function (data) {
      updateInfo(row, data);
    });
    return false;
  });
};

form(1, 0);
form(2, 2);

function topInsert(id, name) {
  $('#top > tbody:last').after('<tr><td class="l">' + id + '</td><td>' + name + '</td></tr>');
}

top(15, function (top) {
  for (var i = 0; i < top.length; i++) {
    topInsert(top[i].id, top[i].username);
  }
});
