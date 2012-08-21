var JSONStream = require('JSONStream'),
    request = require('request'),
    fs = require('fs');

var config = JSON.parse(fs.readFileSync('config.json'));

var stream = JSONStream.parse(['gameend']),
    req = request({ url: config.host + ':' + config.port });

req.pipe(stream);

stream.on('data', function (data) {
  console.log(data);
});
