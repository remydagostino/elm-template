/*eslint-env node */

var _ = require('lodash');
var elmMakePath = require('elm')['elm-make'];
var fs = require('fs');
var Future = require('bluebird');
var jsStringEscape = require('js-string-escape');
var path = require('path');
var spawnChildProcess = require('child_process').spawn;
var uglify = require('uglify-js');


module.exports = {
  build: build,
  rebuilder: rebuilder,
  serveTests: serveTests
};

function build(config) {
  var elmMainFile = path.join(config.frontend, 'elm', 'App.elm');
  var targetFile = path.join(config.build, 'elm.js');
  var uncompressedTarget = path.join(config.build, 'elm-uncompressed.js');

  if (config.devBuild) {
    return compile(elmMainFile, targetFile);
  } else {
    return compile(elmMainFile, uncompressedTarget)
    .then(function() {
      return Future.promisify(fs.writeFile)(
        targetFile,
        uglify.minify(uncompressedTarget).code
      );
    });
  }
}

function compile(src, output) {
  var deferred = Future.pending();
  var errContent = '';
  var proc = spawnElmCompiler(src, output);

  proc.stderr.on('data', function(data) {
    errContent += data;
  });

  proc.on('close', function(exitCode) {
    if (exitCode === 0) {
      deferred.resolve();
    } else {
      deferred.reject({
        message: errContent
      });
    }
  });

  return deferred.promise;
}

function rebuilder(config) {
  var elmDir = path.join(config.frontend, 'elm');

  return function(req, res, next) {
    return compile(
      path.join(elmDir, 'App.elm'),
      path.join(config.build, 'elm.js')
    )
    .then(
      function() {
        next();
      },
      function(err) {
        // Handle errors by slapping a the message into the body
        res.set('Content-Type', 'application/javascript');
        res.send(errorDumpScript(err.message));
      }
    );
  };

  function errorDumpScript(msg) {
    var safe = jsStringEscape(msg);

    return (
      'window.document.body.innerHTML = "<pre>' + safe + '</pre>";'
    );
  }
}

function serveTests(config) {
  var testTarget = path.join(config.build, 'elm-tests.html');

  return function(req, res) {
    compile(
      path.join(config.tests, 'elm', 'test-runner.elm'),
      testTarget
    ).then(
      function() { res.sendFile(testTarget); },
      function() { res.sendStatus(500); }
    );
  };
}


function spawnElmCompiler(source, outputPath) {
  var processArgs = [
    source,
    '--yes',
    // '--report=json',
    // '--warn',
    '--output', outputPath.replace(/ /g, '\\ ')
  ];

  return spawnChildProcess(
    elmMakePath,
    processArgs,
    {
      env: _.merge({LANG: 'en_US.UTF-8'}, process.env),
      stdio: 'pipe'
    }
  );
}
