var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

function destroy_db (callback) {
  nano.db.create("de1", function () {
    nano.db.destroy("de1", function (e,b) {
      callback(e,b);
      return;
    });
  });
}

function destroy_db_ok (e,b) {
  assert.isNull(e);
  assert.equal(b.ok, true);
}

vows.describe('nano.db.destroy').addBatch({
  "destroy_db": {
    topic: function () { destroy_db(this.callback); }
  , "=": destroy_db_ok
  }
}).exportTo(module);