var ensure = require('../../ensure').use('vows')
  , assert = require('assert')
  , tests = exports;

tests.good    = function (cb) { cb(true); };
tests.good_ok = function (t)  { assert.ok(t); };

tests.bad    = function (cb) { cb(null); };
tests.bad_ok = function (t)  { assert.ok(t); };

tests.also_good    = tests.good;
tests.also_good_ok = tests.good_ok;

ensure((__filename + '_single_test'), tests, module, 'good');
ensure((__filename + '_mult_test'), tests, module,'good,also_good');