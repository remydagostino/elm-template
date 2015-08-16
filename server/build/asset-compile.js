var Future = require('bluebird');
var fs = require('fs');
var path = require('path');
var rebuild = require('../lib/rebuild');
var ncp = require('ncp');

var copyDir = ncp.ncp;

module.exports = {
  build: build,
  rebuilder: rebuilder
};

function build(config) {
  return Future.promisify(copyDir)(
    path.join(config.frontend, 'assets'),
    path.join(config.build, 'static'),
    { clobber: true }
  );
}

function rebuilder(config) {
  var assetDir = path.join(config.frontend, 'assets');

  return rebuild.rebuilder(
    rebuild.dirWatcher(assetDir, 'Rebuilding assets', config.log),
    function(files) {
      return Future.all(files.map(copyAssetFile));
    },
    config.log
  );

  function copyAssetFile(file) {
    var deferred = Future.pending();

    fs.createReadStream(file.path)
    .pipe(fs.createWriteStream(targetAssetPath(file.path)))
    .on('close', function() {
      return deferred.resolve();
    })
    .on('error', function(err) {
      return deferred.reject(err);
    });

    return deferred.promise;
  }

  function targetAssetPath(filePath) {
    return path.join(config.build, 'static', relativeAssetPath(filePath));
  }

  function relativeAssetPath(filePath) {
    return path.relative(assetDir, filePath);
  }
}
