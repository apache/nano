var vows     = require('vows')
  , assert   = require('assert')
  , err    = require('../../error');

/*****************************************************************************
 * empty_error                                                               *
 *****************************************************************************/
function empty_error(callback) {
  callback(null,err.couch(null,null,null,null));
}

function empty_error_ok(_,e) {
  assert.equal(e.message, "Unknown Error");
  assert.equal(e.status_code, 500);
  assert.equal(e.error, "unknown");
  assert.ok(typeof e.request === 'object');
}

/*****************************************************************************
 * error_412                                                                 *
 *****************************************************************************/
function error_412(callback) {
  callback(null,err.couch(null,null,null,412));
}

function error_412_ok(_,e) {
  assert.equal(e.message, "Precondition Failed");
  assert.equal(e.status_code, 412);
  assert.equal(e.error, "unknown");
  assert.ok(typeof e.request === 'object');
}

vows.describe('error').addBatch({
  "empty_error": {
    topic: function () { empty_error(this.callback); }
  , "=": empty_error_ok },
  "error_412": {
    topic: function () { error_412(this.callback); }
  , "=": error_412_ok }
}).exportTo(module);
