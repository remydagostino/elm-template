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
          return Future.resolve();
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
