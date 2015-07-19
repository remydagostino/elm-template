var Future = require('bluebird');
var elmCompiler = require('node-elm-compiler');

module.exports = {
  compile: compile
};

function compile(src, output) {
  var deferred = Future.pending();

  elmCompiler.compile(src, { output: output, yes: true })
  .on('close', function(exitCode) {
    if (exitCode === 0) {
      deferred.resolve();
    } else {
      deferred.reject(exitCode);
    }
  });

  return deferred.promise;
}
