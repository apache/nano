var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

function destroyDb (callback) {
  nano.db.create("de1", function () {
    nano.db.destroy("de1", function (e,b) {
      callback(e,b);
      return;
    });
  });
}

function destroyDbWorked (e,b) {
  assert.isNull(e);
  assert.equal(b.ok, true);
}

vows.describe('nano.db.destroy').addBatch({
  "nano.db.destroy(foo)": {
    topic: function () { destroyDb(this.callback); }
  , "=": destroyDbWorked
  }
}).exportTo(module);