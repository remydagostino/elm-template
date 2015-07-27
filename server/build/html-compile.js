var Future = require('bluebird');
var fs = require('fs');
var css = require('./css-compile');

module.exports = {
  compile: compile
};

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
