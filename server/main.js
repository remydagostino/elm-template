/*global __dirname */

var express = require('express');
var path = require('path');
var build = require('./build/build');
var rebuild = require('./build/rebuild');

var rootDir = path.join(__dirname, '..');
var dirConfig = {
  root: rootDir,
  build: path.join(rootDir, '_build'),
  frontend: path.join(rootDir, 'frontend')
};

var devMode = true;

build.devBuild(dirConfig).then(function() {
  var app = express();

  // Rebuild on request in dev mode
  if (devMode) {
    app.use('/static',   rebuild.assetHandler(dirConfig));
    app.use('/styles',   rebuild.cssModulesHandler(dirConfig));
    app.get('/index.js', rebuild.jsHandler(dirConfig));
    app.get('/elm.js',   rebuild.elmHandler(dirConfig));
    app.get('/',         rebuild.indexHandler(dirConfig));
  }

  app.use('/static',   express.static(path.join(dirConfig.build, 'static')));
  app.use('/styles',   express.static(path.join(dirConfig.build, 'styles')));
  app.get('/index.js', serveFile(path.join(dirConfig.build, 'index.js')));
  app.get('/elm.js',   serveFile(path.join(dirConfig.build, 'elm.js')));
  app.get('/',         serveFile(path.join(dirConfig.build, 'index.html')));

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
});

function serveFile(file) {
  return function(req, res) {
    res.sendFile(file);
  };
}
