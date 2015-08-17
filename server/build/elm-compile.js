var elmCompiler = require('node-elm-compiler');
var fs = require('fs');
var Future = require('bluebird');
var path = require('path');
var rebuild = require('../lib/rebuild');
var uglify = require('uglify-js');

module.exports = {
  build: build,
  rebuilder: rebuilder
};

function build(config) {
  var elmMainFile = path.join(config.frontend, 'elm', 'main.elm');
  var targetFile = path.join(config.build, 'elm.js');
  var uncompressedTarget = path.join(config.build, 'elm-uncompressed.js');

  if (config.devBuild) {
    return compile(elmMainFile, targetFile);
  } else {
    return compile(elmMainFile, uncompressedTarget)
    .then(function() {
      return Future.promisify(fs.writeFile)(
        targetFile,
        uglify.minify(uncompressedTarget).code
      );
    });
  }
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
