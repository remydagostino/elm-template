/*global __dirname */

var express = require('express');
var path = require('path');
var build = require('./build/build');

var rootDir = path.join(__dirname, '..');
var dirConfig = {
  root: rootDir,
  build: path.join(rootDir, '_build'),
  frontend: path.join(rootDir, 'frontend')
};

build.devBuild(dirConfig).then(function() {
  var app = express();

  app.use('/static', express.static(path.join(dirConfig.build, 'static')));
  app.use('/styles', express.static(path.join(dirConfig.build, 'styles')));

  app.get('/', function (req, res) {
    res.sendFile(path.join(dirConfig.build, 'index.html'));
  });

  app.get('/index.js', function (req, res) {
    res.sendFile(path.join(dirConfig.build, 'index.js'));
  });

  app.get('/elm.js', function (req, res) {
    res.sendFile(path.join(dirConfig.build, 'elm.js'));
  });

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
});
