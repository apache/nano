var vows    = require('/usr/lib/node_modules/vows/lib/vows')
  , assert  = require('assert')
  , cfg     = require('../../cfg/tests.js')
  , nano    = require('../../nano')(cfg)
  , db_name = "doc_ge1"
  , db      = nano.use(db_name);

/*****************************************************************************
 * get_doc                                                                   *
 *****************************************************************************/
function get_doc(callback) {
  nano.db.create(db_name, function () {
    db.insert("foo", {foo: "bar"}, function () {
      db.get("foo", function (e,h,b) {
        callback(e,h,b);
        return;
      });
    });
  });
}

function get_doc_ok(e,h,b) {
  nano.db.destroy(db_name);
  assert.isNull(e);
  assert.ok(b._rev);
  assert.equal(b._id, "foo");
  assert.equal(b.foo, "bar");
}

vows.describe('db.get').addBatch({
  "get_doc": {
    topic: function () { get_doc(this.callback); }
  , "=": get_doc_ok
  }
}).exportTo(module);