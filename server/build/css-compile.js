var postcss = require('postcss');
var postcssImport = require('postcss-import');
var postcssAssets = require('postcss-assets');
var concatStream = require('concat-stream');
var fs = require('fs');
var Future = require('bluebird');
var path = require('path');
var rebuild = require('../lib/rebuild');
var ncp = require('ncp');

var copyDir = ncp.ncp;

module.exports = {
  build: build,
  rebuilder: rebuilder,

  readAndTransform: readAndTransform
};

function build(config) {
  var cssModulesDir = path.join(config.frontend, 'css', 'modules');
  var cssOutputDir = path.join(config.build, 'styles');

  return Future.promisify(copyDir)(
    cssModulesDir,
    cssOutputDir,
    {
      clobber: true,
      transform: transformStream(cssModulesDir, config.log)
    }
  );
}

function compile(filePath, cssContent) {
  try {
    return Promise.resolve(
      postcss()
      .use(postcssImport())
      .process(cssContent, { from: filePath })
      .css
    );
  }
  catch (ex) {
    return Promise.reject({
      message: 'Failed to compile css: "' + filePath + '":\n\n' + ex.message,
      stack: ex.stack
    });
  }
}

function readAndTransform(filePath) {
  return Future.promisify(fs.readFile)(filePath)
  .then(compile.bind(null, filePath));
}

function transformStream(cssDir, log) {
  return function(read, write, file) {
    read.pipe(concatStream(
      { encoding: 'string' },
      function(css) {
        compile(file.name, css).then(
          function(compiledCss) { write.end(compiledCss); },
          function(err)         { log('error', err.message, err.stack); }
        );
      }
    ));
  };
}

function rebuilder(config) {
  var cssModulesDir = path.join(config.frontend, 'css', 'modules');

  return rebuild.rebuilder(
    rebuild.dirWatcher(cssModulesDir, 'Rebuilding CSS modules', config.log),
    function(files) {
      return Future.all(files.map(transformCssFile));
    },
    config.log
  );

  function transformCssFile(file) {
    return readAndTransform(file.path)
    .then(function(css) {
      return Future.promisify(fs.writeFile)(targetCssPath(file.path), css);
    });
  }

  function targetCssPath(filePath) {
    return path.join(config.build, 'styles', relativeCssPath(filePath));
  }

  function relativeCssPath(filePath) {
    return path.relative(cssModulesDir, filePath);
  }
}

