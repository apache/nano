var ensure = require('../../ensure').use('vows')
  , assert = require('assert')
  , tests = exports
  ;

tests.foo    = function (cb) { cb(true); };
tests.foo_ok = function (t)  { assert.ok(t); };

tests.bar    = function (cb) { cb(null,'bar'); };
tests.bar_ok = function (_,t)  { assert.equal(t,'bar'); };

ensure(__filename,tests,module);