var vows    = require('vows')
  , assert  = require('assert')
  , cfg     = require('../../cfg/tests.js')
  , nano    = require('../../nano')(cfg)
  , db_name = "doc_up1"
  , db      = nano.use(db_name);

/*****************************************************************************
 * update_doc                                                                *
 *****************************************************************************/
function update_doc(callback) {
  nano.db.create(db_name, function () {
    db.insert("foo", {foo: "bar"}, function (_,_,b) {
      db.update("foo", b.rev, {foo: "baz"}, function (e,_,b) {
        callback(e,b);
        return;
      });
    });
  });
}

function update_doc_ok(e,b) {
  nano.db.destroy(db_name);
  assert.isNull(e);
  assert.equal(b.id, "foo");
  assert.ok(b.ok);
  assert.ok(b.rev);
}

vows.describe('db.update').addBatch({
  "update_doc": {
    topic: function () { update_doc(this.callback); }
  , "=": update_doc_ok
  }
}).exportTo(module);