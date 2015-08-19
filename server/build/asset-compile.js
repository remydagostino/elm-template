var copy = require('../lib/copy');
var Future = require('bluebird');
var path = require('path');
var rebuild = require('../lib/rebuild');

module.exports = {
  build: build,
  rebuilder: rebuilder
};

function build(config) {
  return copy.dirForced(
    path.join(config.frontend, 'assets'),
    path.join(config.build, 'static')
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
    return copy.file(file.path, targetAssetPath(file.path));
  }

  function targetAssetPath(filePath) {
    return path.join(config.build, 'static', relativeAssetPath(filePath));
  }

  function relativeAssetPath(filePath) {
    return path.relative(assetDir, filePath);
  }
}
