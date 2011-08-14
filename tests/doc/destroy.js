var vows    = require('/usr/lib/node_modules/vows/lib/vows')
  , assert  = require('assert')
  , cfg     = require('../../cfg/tests.js')
  , nano    = require('../../nano')(cfg)
  , db_name = "doc_de1"
  , db      = nano.use(db_name);

/*****************************************************************************
 * destroy_doc                                                               *
 *****************************************************************************/
function destroy_doc(callback) {
  nano.db.create(db_name, function () {
    db.insert("foo", {foo: "bar"}, function (e,h,b) {
      db.destroy("foo", b.rev, function (e,h,b) {
        callback(e,h,b);
        return;
      });
    });
  });
}

function destroy_doc_ok(e,h,b) {
  assert.isNull(e);
  assert.ok(b.ok);
  assert.equal(b.id, "foo");
  assert.ok(b.rev);
  nano.db.destroy(db_name);
}

vows.describe('db.destroy').addBatch({
  "destroy_doc": {
    topic: function () { destroy_doc(this.callback); }
  , "=": destroy_doc_ok
  }
}).exportTo(module);