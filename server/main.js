/*eslint-env node */

var _ = require('lodash');
var express = require('express');
var path = require('path');
var rebuild = require('./build/rebuild');
var Future = require('bluebird');
var build = require('./build/build');

var rootDir = path.join(__dirname, '..');
var config = {
  root: rootDir,
  build: path.join(rootDir, '_build'),
  frontend: path.join(rootDir, 'frontend'),
  log: function(level) {
    console[level].apply(console, _.rest(arguments)); //eslint-disable-line
  },
  devMode: process.env.STAGE === 'development'
};

var app = express();

// Rebuild on request in dev mode
if (config.devMode) {
  app.use('/static',   rebuild.assets(config));
  app.get('/index.js', rebuild.js(config));
  app.get('/elm.js',   rebuild.elm(config));
  app.get('/',         rebuild.index(config));
}

// Wait until the intial build is done before serving
initialBuild().then(function() {
  app.use('/static',   express.static(path.join(config.build, 'static')));
  app.get('/index.js', serveFile(path.join(config.build, 'index.js')));
  app.get('/elm.js',   serveFile(path.join(config.build, 'elm.js')));
  app.get('/',         serveFile(path.join(config.build, 'index.html')));

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    config.log('info', 'Example app listening at http://%s:%s', host, port);
  });
});

function serveFile(file) {
  return function(req, res) {
    res.sendFile(file);
  };
}

function initialBuild() {
  if (config.devMode) {
    return Future.resolve();
  } else {
    return build.fullBuild(config);
  }
}
