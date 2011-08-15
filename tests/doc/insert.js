var vows    = require('/usr/lib/node_modules/vows/lib/vows')
  , assert  = require('assert')
  , cfg     = require('../../cfg/tests.js')
  , nano    = require('../../nano')(cfg)
  , db_name = "doc_in1"
  , db      = nano.use(db_name);

/*****************************************************************************
 * insert_doc                                                                *
 *****************************************************************************/
function insert_doc(callback) {
  nano.db.create(db_name, function () {
    db.insert({foo: "bar"}, callback);
  });
}

function insert_doc_ok(e,h,b) {
  assert.isNull(e);
  assert.ok(b.ok);
  assert.ok(b.rev);
  assert.ok(b.id);
  nano.db.destroy(db_name);
}

vows.describe('db.insert').addBatch({
  "insert_doc": {
    topic: function () { insert_doc(this.callback); }
  , "=": insert_doc_ok
  }
}).exportTo(module);