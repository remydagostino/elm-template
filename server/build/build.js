var Future = require('bluebird');
var fs = require('fs');
var rimraf = require('rimraf');

module.exports = {
  fullBuild: fullBuild,
  cleanBuild: cleanBuild
};

function fullBuild(config) {
  return cleanBuild(config)
  .then(function() {
    return Future.all(
      [
        require('./elm-compile'),
        require('./asset-compile'),
        require('./css-compile'),
        require('./js-compile'),
        require('./html-compile')
      ].map(function(resource) {
        return resource.build(config);
      })
    );
  });
}

function cleanBuild(config) {
  var destroy = Future.promisify(rimraf);
  var create = Future.promisify(fs.mkdir);

  return destroy(config.build)
    .then(function() {
      return create(config.build);
    });
}
