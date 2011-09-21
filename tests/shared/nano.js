var ensure = require('ensure')
  , nano   = require('../../nano')
  , tests    = exports;

tests.version = function (callback) { callback(null,nano.version); };
tests.version_ok = function (_,n) { this.t.ok(n); };

tests.path = function (callback) { callback(null,nano.path); };
tests.path_ok = function (_,n) { this.t.ok(n); };

ensure(__filename,tests,module,process.argv[2]);