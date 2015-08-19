module.exports = {
  assets: require('./asset-compile').rebuilder,
  js:     require('./js-compile').rebuilder,
  elm:    require('./elm-compile').rebuilder,
  index:  require('./html-compile').rebuilder
};


