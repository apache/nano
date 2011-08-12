var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

function destroyDb (callback) {
  nano.db.create("ge1", function () {
    nano.db.get("ge1", function (e,b) {
      callback(e,b);
      return;
    });
  });
}

function destroyDbWorked (e,b) {
  assert.isNull(e);
  assert.equal(b.doc_count,0);
  assert.equal(b.doc_del_count,0);
  assert.equal(b.db_name,"ge1");  
}

vows.describe('nano.db.destroy').addBatch({
  "nano.db.destroy(foo)": {
    topic: function () { destroyDb(this.callback); }
  , "=": destroyDbWorked
  }
}).exportTo(module);