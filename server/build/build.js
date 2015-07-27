/* Project specific build functions */

var css = require('./css-compile');
var js = require('./js-compile');
var elm = require('./elm-compile');
var html = require('./html-compile');
var path = require('path');
var Future = require('bluebird');
var fs = require('fs');
var ncp = require('ncp');
var rimraf = require('rimraf');

var copyDir = ncp.ncp;

module.exports = {
  devBuild: devBuild
};

function devBuild(dirConfig) {
  return cleanBuild(dirConfig)()
  .then(createBuildDir(dirConfig))
  .then(function() {
    return Future.all([
      buildElm(dirConfig)(),
      processAssets(dirConfig)(),
      processStyles(dirConfig)(),
      buildJs(dirConfig)(),
      buildHtml(dirConfig)()
    ]);
  });
}

function buildJs(dirConfig) {
  return function() {
    return js.compile(
      path.join(dirConfig.frontend, 'js', 'main.js'),
      path.join(dirConfig.build, 'index.js')
    );
  };
}

function buildHtml(dirConfig) {
  return function() {
    return html.compile(
      path.join(dirConfig.frontend, 'index.tmpl'),
      path.join(dirConfig.frontend, 'css', 'core', 'core.css'),
      path.join(dirConfig.build, 'index.html')
    );
  };
}

function processStyles(dirConfig) {
  var cssModulesDir = path.join(dirConfig.frontend, 'css', 'modules');
  var cssOutputDir = path.join(dirConfig.build, 'styles');

  return function() {
    return Future.promisify(copyDir)(
      cssModulesDir,
      cssOutputDir,
      {
        clobber: true,
        transform: css.transformStream(cssModulesDir)
      }
    );
  };
}

function processAssets(dirConfig) {
  return function() {
    return Future.promisify(copyDir)(
      path.join(dirConfig.frontend, 'assets'),
      path.join(dirConfig.build, 'static'),
      { clobber: true }
    );
  };
}

function buildElm(dirConfig) {
  return function() {
    return elm.compile(
      path.join(dirConfig.frontend, 'elm', 'main.elm'),
      path.join(dirConfig.build, 'elm.js')
    );
  };
}

function createBuildDir(dirConfig) {
  return function() {
    return Future.promisify(fs.mkdir)(dirConfig.build);
  };
}

function cleanBuild(dirConfig) {
  return function() {
    return Future.promisify(rimraf)(dirConfig.build);
  };
}
