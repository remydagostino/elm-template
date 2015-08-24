var _ = require('lodash');
var Future = require('bluebird');
var path = require('path');
var watch = require('./watch');

module.exports = {
  rebuilder: rebuilder,

  dirWatcher: dirWatcher,
  fileWatcher: fileWatcher,
  alwaysRebuild: alwaysRebuild
};

/**
 * Creates a stateful express middleware that blocks requests to a resource
 * while compiling source files.
 *
 * @param  {Function} fileFinder Accepts a single argument of the last
 *                               successful build. Returns a promise
 *                               containing all files that have changed since.
 * @param  {Function} rebuildFn  A function which accepts an array of changed
 *                               files and returns a promise that resolves when
 *                               the rebuild has completed.
 * @param  {Function} log        A logging function which accepts a log level
 *                               string and any number of message arguments.
 * @return {Function}            Express.js middleware
 */
function rebuilder(fileFinder, rebuildFn, log) {
  var lastPromise = Future.resolve();
  var modtime = 0;

  return function(req, res, next) {
    lastPromise = lastPromise.then(function() {
      return fileFinder(modtime)
      .then(rebuildChangedFiles)
      .then(
        function() { next(); },
        function(err) {
          log('error', 'Rebuilding failed', err, err.stack);
          res.sendStatus(500);
        }
      );
    });
  };

  function rebuildChangedFiles(changes) {
    if (changes.modtime > modtime) {
      modtime = changes.modtime;
      return rebuildFn(changes.files);
    } else {
      return Future.resolve();
    }
  }
}


function alwaysRebuild() {
  return function() {
    return Future.resolve({
      files: [],
      modtime: Date.now()
    });
  };
}


function dirWatcher(dir, message, log) {
  return function(lastModtime) {
    return watch.getModifiedInDir(dir, lastModtime)
    .then(function(files) {
      if (files.length > 0) {
        log('log', message + ': ', relativePaths(files));
      }

      return {
        files: files,
        modtime: files.length > 0
          ? _.max(_.pluck(files, 'timestamp'))
          : lastModtime
      };
    });
  };

  function relativePaths(files) {
    return _.pluck(files, 'path').map(function(filePath) {
      return path.relative(dir, filePath);
    });
  }
}


function fileWatcher(file, message, log) {
  return function(lastModtime) {
    return watch.getModifiedFile(file, lastModtime)
    .then(function(files) {
      if (files.length > 0) {
        log('log', message);
      }

      return {
        files: files,
        modtime: files.length > 0
          ? _.max(_.pluck(files, 'timestamp'))
          : lastModtime
      };
    });
  };
}
