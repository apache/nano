var vows   = require('/usr/lib/node_modules/vows/lib/vows')
  , assert = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

function get_doc(callback) {
  nano.db.create("doc_ge1", function () {
    nano.insert("doc_ge1", "foo", {foo: "bar"}, function () {
      nano.get("doc_ge1", "foo", function (e,b) {
        callback(e,b);
        return;
      });
    });
  });
}

function get_doc_ok(e,b) {
  assert.isNull(e);
  assert.equal(b,0);
  nano.db.destroy("doc_ge1");
}

vows.describe('nano.get').addBatch({
  "get_doc": {
    topic: function () { get_doc(this.callback); }
  , "=": get_doc_ok
  }
}).exportTo(module);