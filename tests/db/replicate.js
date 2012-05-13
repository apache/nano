var specify  = require('specify')
  , async    = require('async')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock    = nock(helpers.couch, "db/replicate")
  , db      = nano.use("db_replicate")
  , replica = nano.use("db_replica")
  ;

specify("db_replicate:setup", timeout, function (assert) {
  nano.db.create("db_replicate", function (err) {
    assert.equal(err, undefined, "Failed to create database");
     nano.db.create("db_replica", function (err) {
       assert.equal(err, undefined, "Failed to create replica database");
       async.parallel(
         [ function(cb) { db.insert({"foo": "bar"}, "foobar", cb); }
         , function(cb) { db.insert({"bar": "foo"}, "barfoo", cb); }
         , function(cb) { db.insert({"foo": "baz"}, "foobaz", cb); }
         ]
       , function(error, results){
         assert.equal(error, undefined, "Should have stored docs");
       });
     });
  });
});

specify("db_replicate:test", timeout, function (assert) {
  db.replicate("db_replica", function(error) {
    assert.equal(error, undefined, "Should be able to replicate");
    replica.list(function (error, list) {
      assert.equal(error, undefined, "Should be able to list");
      assert.equal(list.total_rows, 3, "Should have three documents");
    });
  });
});

specify("db_replicate:teardown", timeout, function (assert) {
  nano.db.destroy("db_replicate", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    nano.db.destroy("db_replica", function (err) {
      assert.equal(err, undefined, "Failed to destroy replica database");
      assert.ok(mock.isDone(), "Some mocks didn't run");
    });
  });
});

specify.run(process.argv.slice(2));