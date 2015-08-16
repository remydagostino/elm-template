var Future = require('bluebird');
var walk = require('walk');
var path = require('path');
var fs = require('fs');

module.exports = {
  getModifiedFile: getModifiedFile,
  getModifiedInDir: getModifiedInDir
};

/**
 * Returns an array containing the path and timestamp of a file if it has been
 * modified since the last timestamp
 * @param  {String} filePath
 * @param  {Number} lastTimestamp
 * @return {Array.<Promise.<File>>}
 */
function getModifiedFile(filePath, lastTimestamp) {
  return Future.promisify(fs.stat)(filePath)
  .then(function(stats) {
    return getFileIfModified(filePath, stats, lastTimestamp);
  });
}

/**
 * Returns the paths and timestamps of all files that have been changed in a
 * directory since the last timestamp
 * @param  {String} dir
 * @param  {Number} lastTimestamp
 * @return {Array.<Promise.<File>>}
 */
function getModifiedInDir(dir, lastTimestamp) {
  var deferred = Future.pending();
  var files = [];
  var walker = walk.walk(dir, { followLinks: false });

  walker.on('file', function(rootDir, stats, next) {
    files = files.concat(getFileIfModified(
      path.join(rootDir, stats.name),
      stats,
      lastTimestamp
    ));

    next();
  });

  walker.on('end', function() {
    deferred.resolve(files);
  });

  walker.on('directoryError', function(rootDir, stat, next) {
    deferred.reject('Error reading directory: ' + rootDir);
  });

  walker.on('nodeError', function(rootDir, stat, next) {
    var fileName = path.join(rootDir, stat.name);

    deferred.reject('Error reading file stats: ' + fileName);
  });

  return deferred.promise;
}

function getFileIfModified(filePath, fileStats, lastTimestamp) {
  var timestamp = fileStats.mtime.getTime();

  if (timestamp > lastTimestamp) {
    return [{
      timestamp: timestamp,
      path: filePath
    }];
  } else {
    return [];
  }
}
