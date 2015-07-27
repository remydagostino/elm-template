var postcss = require('postcss');
var postcssImport = require('postcss-import');
var postcssAssets = require('postcss-assets');
var concatStream = require('concat-stream');
var fs = require('fs');
var Future = require('bluebird');

module.exports = {
  rewriteCss: rewriteCss,
  transformStream: transformStream,
  readAndTransform: readAndTransform,
  readAndWrite: readAndWrite
};

function rewriteCss(filePath, css) {
  try {
    return postcss()
    .use(postcssImport())
    .process(css, { from: filePath })
    .css;
  }
  catch (ex) {
    console.error('Failed to compile "' + filePath + '":\n\n' + ex.message);
    return '';
  }
}

function readAndTransform(filePath) {
  return Future.promisify(fs.readFile)(filePath)
  .then(rewriteCss.bind(null, filePath));
}

function readAndWrite(filePath, targetPath) {
  return readAndTransform(filePath)
  .then(function(css) {
    return Future.promisify(fs.writeFile)(targetPath, css);
  });
}

function transformStream(cssDir) {
  return function(read, write, file) {
    read.pipe(concatStream(
      { encoding: 'string' },
      function(css) {
        write.end(rewriteCss(file.name, css));
      }
    ));
  };
}
