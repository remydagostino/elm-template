var browserify = require('browserify');
var fs = require('fs');
var Future = require('bluebird');
var path = require('path');
var rebuild = require('../lib/rebuild');

module.exports = {
  build: build,
  rebuilder: rebuilder
};

function compile(mainJs, outputFile) {
  var deferred = Future.pending();

  browserify(mainJs)
  .bundle()
  .pipe(fs.createWriteStream(outputFile))
  .on('error', function(e) {
    deferred.reject(e);
  })
  .on('close', function() {
    deferred.resolve();
  });

  return deferred.promise;
}

function build(config) {
  return compile(
    path.join(config.frontend, 'js', 'main.js'),
    path.join(config.build, 'index.js')
  );
}

function rebuilder(config) {
  var jsDir = path.join(config.frontend, 'js');

  return rebuild.rebuilder(
    rebuild.dirWatcher(jsDir, 'Rebuilding JS', config.log),
    function(files) {
      return compile(
        path.join(jsDir, 'main.js'),
        path.join(config.build, 'index.js')
      );
    },
    config.log
  );
}
