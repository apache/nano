var ensure = require('../../ensure').use('vows')
  , assert = require('assert')
  , tests = exports
  ;

tests.vows    = function (cb) { cb(true); };
tests.vows_ok = function (t)  { assert.ok(t); };

ensure(__filename ,tests,module);