/*eslint-env node */

var _ = require('lodash');
var build = require('./build/build');
var compression = require('compression');
var elm = require('./build/elm-compile');
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var rebuild = require('./build/rebuild');

var rootDir = path.join(__dirname, '..');
var config = {
  root: rootDir,
  build: path.join(rootDir, '_build'),
  frontend: path.join(rootDir, 'frontend'),
  tests: path.join(rootDir, 'tests'),
  log: function(level) {
    console[level].apply(console, _.rest(arguments)); //eslint-disable-line
  },
  devMode: process.env.STAGE === 'development'
};

var app = express();

// Rebuild on request in dev mode
if (config.devMode) {
  app.get('/elm-tests.html', elm.serveTests(config));

  app.use(morgan('dev'));

  app.use('/static',   rebuild.assets(config));
  app.get('/index.js', rebuild.js(config));
  app.get('/elm.js',   rebuild.elm(config));
  app.get('/',         rebuild.index(config));
} else {
  app.use(morgan('common'));
  app.use(compression());
}

app.use('/static',   express.static(path.join(config.build, 'static')));
app.get('/index.js', serveFile(path.join(config.build, 'index.js')));
app.get('/elm.js',   serveFile(path.join(config.build, 'elm.js')));
app.get('/',         serveFile(path.join(config.build, 'index.html')));

// Wait until the intial build is done before serving
initialBuild().then(function() {
  var server = app.listen(process.env.PORT || 3000, function () {
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
    return build.cleanBuild(config);
  } else {
    return build.fullBuild(config);
  }
}
