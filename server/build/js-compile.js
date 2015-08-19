var browserify = require('browserify');
var copy = require('../lib/copy');
var fs = require('fs');
var Future = require('bluebird');
var path = require('path');
var rebuild = require('../lib/rebuild');
var through = require('through');
var uglify = require('uglify-js');

module.exports = {
  build: build,
  rebuilder: rebuilder
};

function compile(mainJs, outputFile, devBuild) {
  var deferred = Future.pending();

  browserify(mainJs)
  .bundle()
  .pipe(devBuild ? through() : writeMinified())
  .pipe(fs.createWriteStream(outputFile))
  .on('error', function(e) {
    deferred.reject(e);
  })
  .on('close', function() {
    deferred.resolve();
  });

  return deferred.promise;
}

function writeMinified() {
  return copy.rewriteStream(function(content) {
    return new Future(function(resolve) {
      resolve(uglify.minify(content, { fromString: true}).code);
    });
  });
}

function build(config) {
  return compile(
    path.join(config.frontend, 'js', 'main.js'),
    path.join(config.build, 'index.js'),
    config.devBuild
  );
}

function rebuilder(config) {
  var jsDir = path.join(config.frontend, 'js');

  return rebuild.rebuilder(
    rebuild.dirWatcher(jsDir, 'Rebuilding JS', config.log),
    build.bind(null, config),
    config.log
  );
}
