var copy = require('../lib/copy');
var path = require('path');
var rebuild = require('../lib/rebuild');

module.exports = {
  build: build,
  rebuilder: rebuilder
};

function build(config) {
  return copy.file(
    path.join(config.frontend, 'index.tmpl'),
    path.join(config.build, 'index.html')
  );
}

function rebuilder(config) {
  var indexHtmlFile = path.join(config.frontend, 'index.tmpl');

  return rebuild.rebuilder(
    rebuild.fileWatcher(indexHtmlFile, 'Rebuilding index.tmpl', config.log),
    function(files) {
      return copy.file(
        indexHtmlFile,
        path.join(config.build, 'index.html')
      );
    },
    config.log
  );
}
