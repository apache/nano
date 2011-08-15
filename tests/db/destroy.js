var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

/*****************************************************************************
 * destroy_db                                                                *
 *****************************************************************************/
function destroy_db(callback) {
  nano.db.create("db_de1", function () {
    nano.db.destroy("db_de1", function (e,h,b) {
      callback(e,h,b);
      return;
    });
  });
}

function destroy_db_ok(e,h,b) {
  nano.db.destroy("db_de1");
  assert.isNull(e);
  assert.equal(b.ok, true);
}

vows.describe('nano.db.destroy').addBatch({
  "destroy_db": {
    topic: function () { destroy_db(this.callback); }
  , "=": destroy_db_ok
  }
}).exportTo(module);