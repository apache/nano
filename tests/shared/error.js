var ensure   = require('ensure')
  , assert   = require('assert')
  , err    = require('../../error')
  , tests    = exports;

tests.empty_error = function (callback) {
  callback(null,err.couch(null,null,null,null));
};

tests.empty_error_ok = function (_,e) {
  assert.equal(e.message, "Unknown Error");
  assert.equal(e['status-code'], 500);
  assert.equal(e.error, "unknown");
  assert.ok(typeof e.request === 'object');
};

tests.error_412 = function (callback) {
  callback(null,err.couch(null,null,null,412));
};

tests.error_412_ok = function (_,e) {
  assert.equal(e.message, "Precondition Failed");
  assert.equal(e['status-code'], 412);
  assert.equal(e.error, "unknown");
  assert.ok(typeof e.request === 'object');
};

ensure(__filename, tests, module);