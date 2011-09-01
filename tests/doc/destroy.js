var ensure   = require('ensure')
  , assert   = require('assert')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

tests.destroy_doc = function (callback) {
  var db = nano.use("doc_de1");
  nano.db.create("doc_de1", function () {
    db.insert({foo: "bar"}, "foo", function (_,b) {
      db.destroy("foo", b.rev, function (e,b) {
        callback(e,b);
        return;
      });
    });
  });
};

tests.destroy_doc_ok = function (e,b) {
  nano.db.destroy("doc_de1");
  assert.isNull(e);
  assert.ok(b.ok);
  assert.equal(b.id, "foo");
  assert.ok(b.rev);
};

ensure(__filename, tests, module);