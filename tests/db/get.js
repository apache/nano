var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

function get_db (callback) {
  nano.db.create("ge1", function () {
    nano.db.get("ge1", function (e,b) {
      callback(e,b);
      return;
    });
  });
}

function get_db_ok (e,b) {
  assert.isNull(e);
  assert.equal(b.doc_count,0);
  assert.equal(b.doc_del_count,0);
  assert.equal(b.db_name,"ge1");  
}

vows.describe('nano.db.get').addBatch({
  "get_db": {
    topic: function () { get_db(this.callback); }
  , "=": get_db_ok
  }
}).exportTo(module);