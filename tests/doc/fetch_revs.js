var specify  = require('specify')
  , async    = require('async')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "doc/fetch_revs")
  , db   = nano.use("doc_fetch_revs")
  ;

specify("doc_fetch_revs:setup", timeout, function (assert) {
  nano.db.create("doc_fetch_revs", function (err) {
    assert.equal(err, undefined, "Failed to create database");
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db.insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db.insert({"foo": "baz"}, "foobaz", cb); }
      ]
    , function(error, results) {
      assert.equal(error, undefined, "Should have stored docs");
    });
  });
});

specify("doc_fetch_revs:one_key", timeout, function (assert) {
  db.fetch_revs({keys:["foobar"]}, function (error, docs) {
    assert.equal(error, undefined, 'No errors');
    assert.equal(docs.rows.length, 1, 'One row');
    assert.equal(docs.total_rows, 3, 'Out of 3');
    assert.equal(docs.rows[0].doc, undefined, 'No doc');
  });
});

specify("doc_fetch_revs:multiple_keys", timeout, function (assert) {
  db.fetch_revs({keys:["foobar", "barfoo"]}, function (error, docs) {
    assert.equal(error, undefined, 'No errors');
    assert.equal(docs.rows.length, 2, 'Two rows');
    assert.equal(docs.total_rows, 3, 'Out of 3');
    assert.equal(docs.rows[0].doc, undefined, 'No doc');
    assert.equal(docs.rows[1].doc, undefined, 'No doc');
  });
});

specify("doc_fetch_revs:teardown", timeout, function (assert) {
  nano.db.destroy("doc_fetch_revs", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));