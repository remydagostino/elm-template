var _ = require('lodash');
var Future = require('bluebird');
var path = require('path');
var watch = require('./watch');

module.exports = {
  rebuilder: rebuilder,

  dirWatcher: dirWatcher,
  fileWatcher: fileWatcher,
  combineWatchers: combineWatchers
};

/**
 * Creates a stateful express middleware that blocks requests to a resource
 * while compiling source files.
 *
 * @param  {Function} fileFinder Accepts no arguments. Returns a promise
 *                               containing all files that have changed since it
 *                               was last called.
 * @param  {Function} rebuildFn  A function which accepts an array of changed
 *                               files and returns a promise that resolves when
 *                               the rebuild has completed.
 * @param  {Function} log        A logging function which accepts a log level
 *                               string and any number of message arguments.
 * @return {Function}            Express.js middleware
 */
function rebuilder(fileFinder, rebuildFn, log) {
  var lastPromise = Future.resolve();

  return function(req, res, next) {
    lastPromise = lastPromise.then(function() {
      return fileFinder()
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

  function rebuildChangedFiles(files) {
    if (files.length > 0) {
      return rebuildFn(files);
    } else {
      return Future.resolve();
    }
  }
}

function dirWatcher(dir, message, log) {
  var modtime = 0;

  return function() {
    return watch.getModifiedInDir(dir, modtime)
    .then(function(files) {
      if (files.length > 0) {
        modtime = Math.max(_.max(_.pluck(files, 'timestamp')), modtime);
        log('log', message + ': ', relativePaths(files));
      }

      return files;
    });
  };

  function relativePaths(files) {
    return _.pluck(files, 'path').map(function(filePath) {
      return path.relative(dir, filePath);
    });
  }
}

function fileWatcher(file, message, log) {
  var modtime = 0;

  return function() {
    return watch.getModifiedFile(file, modtime)
    .then(function(files) {
      if (files.length > 0) {
        modtime = Math.max(_.max(_.pluck(files, 'timestamp')), modtime);
        log('log', message);
      }

      return files;
    });
  };
}

function combineWatchers(watchers) {
  return function() {
    return Future.all(_.invoke(watchers, 'call'))
    .then(function(fileLists) {
      return _.flatten(fileLists);
    });
  };
}
