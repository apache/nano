var DEFAULT_ENGINE = 'tap'
  , fs = require('fs')
  ;

module.exports = exports = ensure = require('./engines/'+DEFAULT_ENGINE);
ensure.use     = function (engine) { return require('./engines/'+engine); };
ensure.version = JSON.parse(
  fs.readFileSync(__dirname + "/package.json")).version;
ensure.path    = __dirname;