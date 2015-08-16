var Future = require('bluebird');
var fs = require('fs');
var css = require('./css-compile');
var path = require('path');
var rebuild = require('../lib/rebuild');

module.exports = {
  build: build,
  rebuilder: rebuilder
};

function build(config) {
  return compile(
    path.join(config.frontend, 'index.tmpl'),
    path.join(config.frontend, 'css', 'core', 'core.css'),
    path.join(config.build, 'index.html')
  );
}

function compile(htmlPath, coreCssFile, htmlDest) {
  return Future.all([
    Future.promisify(fs.readFile)(htmlPath, { encoding: 'utf8' }),
    css.readAndTransform(coreCssFile)
  ])
  .spread(function(htmlTemplate, compiledCss) {
    var compiledTemplate = htmlTemplate.replace('{{core-css}}', compiledCss);

    return Future.promisify(fs.writeFile)(htmlDest, compiledTemplate);
  });
}

function rebuilder(config) {
  var coreCssDir = path.join(config.frontend, 'css', 'core');
  var indexHtmlFile = path.join(config.frontend, 'index.tmpl');

  return rebuild.rebuilder(
    rebuild.combineWatchers([
      rebuild.fileWatcher(indexHtmlFile, 'Rebuilding index.tmpl', config.log),
      rebuild.dirWatcher(coreCssDir, 'Rebuilding core CSS', config.log)
    ]),
    function(files) {
      return compile(
        indexHtmlFile,
        path.join(coreCssDir, 'core.css'),
        path.join(config.build, 'index.html')
      );
    },
    config.log
  );
}
