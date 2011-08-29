var vows    = require('vows')
  , assert  = require('assert')
  , cfg     = require('../../cfg/tests.js')
  , nano    = require('../../nano')(cfg);

function db_name(i) { return "doc_in" + i; }
function db(i) { return nano.use(db_name(i)); }

/*****************************************************************************
 * insert_doc                                                                *
 *****************************************************************************/
function insert_doc(callback) {
  nano.db.create(db_name("a"), function () {
    db("a").insert({foo: "bar"}, callback);
  });
}

function insert_doc_ok(e,h,b) {
  nano.db.destroy(db_name("a"));
  assert.isNull(e);
  assert.ok(b.ok);
  assert.ok(b.rev);
  assert.ok(b.id);
}

/*****************************************************************************
 * insert_doc_path                                                           *
 *****************************************************************************/
function insert_doc_path(callback) {
  nano.db.create(db_name("b"), function () {
    db("b").insert({foo: "bar"}, 'some/path', callback);
  });
}

function insert_doc_path_ok(e,h,b) {
  nano.db.destroy(db_name("b"));
  assert.isNull(e);
  assert.ok(b.ok);
  assert.ok(b.rev);
  assert.equal(b.id, "some/path");
}

vows.describe('db.insert').addBatch({
  "insert_doc": {
    topic: function () { insert_doc(this.callback); }
  , "=": insert_doc_ok },
  "insert_doc_path": {
    topic: function () { insert_doc_path(this.callback); }
  , "=": insert_doc_path_ok }
}).exportTo(module);