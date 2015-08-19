var Future = require('bluebird');
var fs = require('fs');
var ncp = require('ncp');
var through = require('through');

var _copyDir = Future.promisify(ncp.ncp);

module.exports = {
  file: copyFile,
  dir: copyDir,
  dirForced: copyDirForced,
  rewriteStream: rewriteStream,
  transformFile: transformFile
};

/**
 * Creates a tranformer stream that drains the whole input and applies
 * a transformation
 * @param  {Function} transform A function which accepts a string and produces
 *                              a promise of a string
 * @return {Stream}             The transoform stream
 */
function rewriteStream(transform) {
  var content = '';

  return through(
    function(data) {
      content += data;
    },
    function() {
      var self = this;

      transform(content)
      .then(
        function(result) {
          self.queue(result);
          self.queue(null);
        },
        function(ex) {
          self.emit('error', ex);
          self.queue(null);
        }
      );
    }
  );
}

function _copyFile(pathFrom, pathTo, transform) {
  var deferred = Future.pending();

  fs.createReadStream(pathFrom)
  .pipe(transform)
  .pipe(fs.createWriteStream(pathTo))
  .on('close', function() {
    return deferred.resolve();
  })
  .on('error', function(err) {
    return deferred.reject(err);
  });

  return deferred.promise;
}

function copyFile(pathFrom, pathTo) {
  return _copyFile(pathFrom, pathTo, through());
}

function transformFile(transformFn, pathFrom, pathTo) {
  return _copyFile(pathFrom, pathTo, rewriteStream(transformFn));
}

function copyDir(pathFrom, pathTo) {
  return _copyDir(pathFrom, pathTo, {});
}

function copyDirForced(pathFrom, pathTo) {
  return _copyDir(pathFrom, pathTo, { clobber: true });
}
