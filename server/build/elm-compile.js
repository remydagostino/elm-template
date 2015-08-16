var Future = require('bluebird');
var elmCompiler = require('node-elm-compiler');
var path = require('path');
var rebuild = require('../lib/rebuild');

module.exports = {
  build: build,
  rebuilder: rebuilder
};

function build(config) {
  return compile(
    path.join(config.frontend, 'elm', 'main.elm'),
    path.join(config.build, 'elm.js')
  );
}

function compile(src, output) {
  var deferred = Future.pending();

  elmCompiler.compile(src, { output: output, yes: true })
  .on('close', function(exitCode) {
    if (exitCode === 0) {
      deferred.resolve();
    } else {
      deferred.reject(exitCode);
    }
  });

  return deferred.promise;
}

function rebuilder(config) {
  var elmDir = path.join(config.frontend, 'elm');

  return rebuild.rebuilder(
    rebuild.dirWatcher(elmDir, 'Rebuilding Elm', config.log),
    function() {
      return compile(
        path.join(elmDir, 'main.elm'),
        path.join(config.build, 'elm.js')
      );
    },
    config.log
  );
}
