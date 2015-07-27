var _ = require('lodash');
var Future = require('bluebird');
var walk = require('walk');
var path = require('path');
var fs = require('fs');
var css = require('./css-compile');
var elm = require('./elm-compile');
var js = require('./js-compile');
var html = require('./html-compile');

module.exports = {
  assetHandler: assetHandler,
  cssModulesHandler: cssModulesHandler,
  jsHandler: jsHandler,
  elmHandler: elmHandler,
  indexHandler: indexHandler
};

function assetHandler(config) {
  var assetDir = path.join(config.frontend, 'assets');

  return rebuilder(
    dirWatcher(assetDir, 'Rebuilding assets'),
    function(files) {
      return Future.all(files.map(copyAssetFile));
    }
  );

  function copyAssetFile(file) {
    var deferred = Future.pending();

    fs.createReadStream(file.path)
    .pipe(fs.createWriteStream(targetAssetPath(file.path)))
    .on('close', function() {
      return deferred.resolve();
    })
    .on('error', function(err) {
      return deferred.reject(err);
    });

    return deferred.promise;
  }

  function targetAssetPath(filePath) {
    return path.join(config.build, 'static', relativeAssetPath(filePath));
  }

  function relativeAssetPath(filePath) {
    return path.relative(assetDir, filePath);
  }
}

function cssModulesHandler(config) {
  var cssModulesDir = path.join(config.frontend, 'css', 'modules');

  return rebuilder(
    dirWatcher(cssModulesDir, 'Rebuilding CSS modules'),
    function(files) {
      return Future.all(files.map(transformCssFile));
    }
  );

  function transformCssFile(file) {
    return css.readAndWrite(file.path, targetCssPath(file.path));
  }

  function targetCssPath(filePath) {
    return path.join(config.build, 'styles', relativeCssPath(filePath));
  }

  function relativeCssPath(filePath) {
    return path.relative(cssModulesDir, filePath);
  }
}

function elmHandler(config) {
  var elmDir = path.join(config.frontend, 'elm');

  return rebuilder(
    dirWatcher(elmDir, 'Rebuilding Elm'),
    function() {
      return elm.compile(
        path.join(elmDir, 'main.elm'),
        path.join(config.build, 'elm.js')
      );
    }
  );
}

function jsHandler(config) {
  var jsDir = path.join(config.frontend, 'js');

  return rebuilder(
    dirWatcher(jsDir, 'Rebuilding JS'),
    function(files) {
      return js.compile(
        path.join(jsDir, 'main.js'),
        path.join(config.build, 'index.js')
      );
    }
  );
}

function indexHandler(config) {
  var coreCssDir = path.join(config.frontend, 'css', 'core');
  var indexHtmlFile = path.join(config.frontend, 'index.tmpl');

  return rebuilder(
    combineWatchers([
      fileWatcher(indexHtmlFile, 'Rebuilding index.tmpl'),
      dirWatcher(coreCssDir, 'Rebuilding core CSS')
    ]),
    function(files) {
      return html.compile(
        indexHtmlFile,
        path.join(coreCssDir, 'core.css'),
        path.join(config.build, 'index.html')
      );
    }
  );
}

function dirWatcher(dir, message) {
  var modtime = 0;

  return function() {
    return dirFilesModifiedSince(dir, modtime)
    .then(function(files) {
      if (files.length > 0) {
        modtime = Math.max(_.max(_.pluck(files, 'timestamp')), modtime);
        console.log(message + ': ', relativePaths(files));
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

function fileWatcher(file, message) {
  var modtime = 0;

  return function() {
    return fileModifiedSince(file, modtime)
    .then(function(files) {
      if (files.length > 0) {
        modtime = Math.max(_.max(_.pluck(files, 'timestamp')), modtime);
        console.log(message);
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

function rebuilder(fileFinder, rebuildFn) {
  var lastPromise = Future.resolve();

  return function(req, res, next) {
    lastPromise = lastPromise.then(function() {
      return fileFinder()
      .then(rebuildChangedFiles)
      .then(function() {
        next();
      });
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

function fileModifiedSince(filePath, lastTimestamp) {
  return Future.promisify(fs.stat)(filePath)
  .then(function(stats) {
    return fileIfModified(filePath, stats, lastTimestamp);
  });
}

function dirFilesModifiedSince(dir, lastTimestamp) {
  var deferred = Future.pending();
  var files = [];
  var walker = walk.walk(dir, { followLinks: false });

  walker.on('file', function(rootDir, stats, next) {
    files = files.concat(fileIfModified(
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

function fileIfModified(filePath, fileStats, lastTimestamp) {
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

