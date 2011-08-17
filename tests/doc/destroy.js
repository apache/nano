var vows    = require('vows')
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
    db.insert({foo: "bar"}, "foo", function (_,_,b) {
      db.destroy("foo", b.rev, function (e,h,b) {
        callback(e,h,b);
        return;
      });
    });
  });
}

function destroy_doc_ok(e,h,b) {
  nano.db.destroy(db_name);
  assert.isNull(e);
  assert.ok(b.ok);
  assert.equal(b.id, "foo");
  assert.ok(b.rev);
}

vows.describe('db.destroy').addBatch({
  "destroy_doc": {
    topic: function () { destroy_doc(this.callback); }
  , "=": destroy_doc_ok
  }
}).exportTo(module);