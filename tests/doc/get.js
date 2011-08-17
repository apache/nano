var vows     = require('vows')
  , assert   = require('assert')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = "doc_ge1"
  , db2_name = "doc_ge2"
  , db       = nano.use(db_name)
  , db2      = nano.use(db2_name);

/*****************************************************************************
 * get_doc                                                                   *
 *****************************************************************************/
function get_doc(callback) {
  nano.db.create(db_name, function () {
    db.insert({foo: "bar"}, "foo", function () {
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

/*****************************************************************************
 * get_doc_params                                                            *
 *****************************************************************************/
function get_doc_params(callback) {
  nano.db.create(db2_name, function () {
    db2.insert({foo: "bar"}, "foo", function () {
      db2.insert({foo: "bar"}, "foo", function () { // Conflict, no rev
        db2.get("foo", {revs_info: true}, function (e,h,b) {
          callback(e,h,b);
          return;
        });
      });
    });
  });
}

function get_doc_params_ok(e,h,b) {
  nano.db.destroy(db2_name);
  assert.isNull(e);
  assert.ok(b._revs_info);
  assert.equal(b._id, "foo");
  assert.equal(b.foo, "bar");
}

vows.describe('db.get').addBatch({
  "get_doc": {
    topic: function () { get_doc(this.callback); }
  , "=": get_doc_ok },
  "get_doc_params": {
    topic: function () { get_doc_params(this.callback); }
  , "=": get_doc_params_ok }
}).exportTo(module);