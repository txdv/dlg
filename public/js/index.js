var socket = io.connect('/index');

function get(id, callback) {
  $.get('/user/' + id, function (data) {
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

/*
  text(1, row).text(data.username);
  text(2, row).find('img').attr('src', data.avatar);
  text(3, row).text((data.vouched ? 'yes' : 'no'));
  text(4, row).text(data.games.played);
  text(5, row).text(data.games.won);
  text(6, row).text(data.games.left);
  */
}


$('#p1').submit(function (event) {
  var id1 = $('#id1').val();
  get(id1, function(data) {
    console.log(data);
    updateInfo(0, data);
  });
  return false;
});

$('#p2').submit(function (event) {
  var id2 = $('#id2').val();
  get(id2, function(data) {
    updateInfo(2, data);
    console.log(data);
  });
  return false;
});
