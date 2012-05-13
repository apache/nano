var specify  = require("specify")
  , helpers  = require("../helpers")
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "doc/handler")
  , db   = nano.use("doc_handler")
  , rev
  ;

specify("doc_handler:setup", timeout, function (assert) {
  nano.db.create("doc_handler", function (err) {
    assert.equal(err, undefined, "Failed to create database");
    db.insert(
    { "updates": 
      { "in-place": function (doc, req) {
          var body = toJSON(req.body);
          return [doc, req.body];
        }
      }
    }, "_design/update", function (error, response) {
      db.insert({"foo": "baz"}, "foobar", function (error, foo) {   
        assert.equal(error, undefined, "Should have stored foo");
        assert.equal(foo.ok, true, "Response should be ok");
        assert.ok(foo.rev, "Response should have rev");
        rev = foo.rev;
      });
    });
  });
});

specify("doc_handler:test", timeout, function (assert) {
  db.updateWithHandler("update", "in-place", "foobar", 
  {field: "foo", value: "bar"}, function (error, response) {
    assert.equal(error, undefined, "Failed to update");
    db.get("foobar", function (error, foobar) {
      assert.equal(error, undefined, "Failed to update");
      assert.equal(foobar._id, "foobar", "My id is foobar");
      assert.equal(foobar.foo, "bar", "Update worked");
    });
  });
});

specify("doc_handler:teardown", timeout, function (assert) {
  nano.db.destroy("doc_handler", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));