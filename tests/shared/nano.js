var ensure = require('ensure')
  , assert = require('assert')
  , nano   = require('../../nano')
  , tests    = exports;

tests.version = function (callback) { callback(null,nano.version); };
tests.version_ok = function (_,n) { assert.ok(n); };

tests.path = function (callback) { callback(null,nano.path); };
tests.path_ok = function (_,n) { assert.ok(n); };

ensure(__filename, tests, module);