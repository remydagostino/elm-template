var Future = require('bluebird');
var browserify = require('browserify');
var fs = require('fs');

module.exports = {
  compile: compile
};

function compile(mainJs, outputFile) {
  var deferred = Future.pending();

  browserify(mainJs)
  .bundle()
  .pipe(fs.createWriteStream(outputFile))
  .on('error', function(e) {
    deferred.reject(e);
  })
  .on('close', function() {
    deferred.resolve();
  });

  return deferred.promise;
}
