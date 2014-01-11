var specify    = require("specify")
  , helpers    = require("../helpers")
  , timeout    = helpers.timeout
  , nano       = helpers.nano
  , nock       = helpers.nock
  ;

var mock = nock(helpers.couch, "multipart/get")
  , db   = nano.use("multipart_get")
  , rev
  ;

specify("multipart_get:setup", timeout, function (assert) {
  nano.db.create("multipart_get", function (err) {
    assert.equal(err, undefined, "Failed to create database");
    var att = {
      name: 'att',
      data: 'Hello World!',
      content_type: 'text/plain'
    };
    db.multipart.insert({"foo": "baz"}, [att], "foobaz", function (error, foo) {
      assert.equal(error, undefined, "Should have stored foobaz");
      assert.equal(foo.ok, true, "Response should be ok");
      assert.equal(foo.id, "foobaz", "My id is foobaz");
      assert.ok(foo.rev, "Response should have rev");
      rev = foo.rev;
    });
  });
});

specify("multipart_get:test", timeout, function (assert) {
  db.multipart.get("foobaz", function (error, foobaz, headers) {
    assert.equal(error, undefined, "Should get foobaz");
    assert.ok(headers['content-type'].match(/^multipart\/related;/));
    assert.equal(typeof foobaz, 'object', "foobaz should be a buffer");
    assert.ok(true);
  });
});

specify("multipart_get:teardown", timeout, function (assert) {
  nano.db.destroy("multipart_get", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));
