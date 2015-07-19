var css = require('./css-compile');
var js = require('./js-compile');
var elm = require('./elm-compile');
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
    var htmlPath = path.join(dirConfig.frontend, 'index.tmpl');
    var coreCssPath = path.join(dirConfig.frontend, 'css', 'core', 'core.css');
    var htmlDest = path.join(dirConfig.build, 'index.html');

    return Future.all([
      Future.promisify(fs.readFile)(htmlPath, { encoding: 'utf8' }),
      css.readAndTransform(coreCssPath)
    ])
    .spread(function(htmlTemplate, compiledCss) {
      var compiledTemplate = htmlTemplate.replace('{{core-css}}', compiledCss);

      return Future.promisify(fs.writeFile)(htmlDest, compiledTemplate);
    });
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
