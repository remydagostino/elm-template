var Future = require('bluebird');
var fs = require('fs');
var ncp = require('ncp');

var _copyDir = Future.promisify(ncp.ncp);

module.exports = {
  file: copyFile,
  dir: copyDir,
  dirForced: copyDirForced
};

function copyFile(pathFrom, pathTo) {
  var deferred = Future.pending();

  fs.createReadStream(pathFrom)
  .pipe(fs.createWriteStream(pathTo))
  .on('close', function() {
    return deferred.resolve();
  })
  .on('error', function(err) {
    return deferred.reject(err);
  });

  return deferred.promise;
}

function copyDir(pathFrom, pathTo) {
  return _copyDir(pathFrom, pathTo, {});
}

function copyDirForced(pathFrom, pathTo) {
  return _copyDir(pathFrom, pathTo, { clobber: true });
}
