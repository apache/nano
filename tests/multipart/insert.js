var specify  = require('specify')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "multipart/insert")
  , db   = nano.use("multipart_insert")
  ;

specify("multipart_insert:setup", timeout, function (assert) {
  nano.db.create("multipart_insert", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("multipart_insert:test", timeout, function (assert) {
  var att = {
    name: 'att',
    data: 'Hello World!',
    content_type: 'text/plain'
  };
  db.multipart.insert({"foo": "baz"}, [att], "foobaz", function (error, foo) {
    assert.equal(error, undefined, "Should have stored foo and attachment");
    assert.equal(foo.ok, true, "Response should be ok");
    assert.ok(foo.rev, "Response should have rev");
  });
});

specify("multipart_insert:test_with_present_attachment", timeout, function (assert) {
  var att = {
    name: 'two',
    data: 'Hello World!',
    content_type: 'text/plain'
  };

  db.attachment.insert("mydoc", "one", "Hello World!", "text/plain", function () {
    db.get("mydoc", function(_, doc) {
      db.multipart.insert(doc, [att], "mydoc", function () {
        db.get("mydoc", function(error, two) {
          assert.equal(error, undefined, "Should get the doc");
          assert.equal(Object.keys(two._attachments).length, 2, "Both attachments should be present");
        });
      });
    });
  });
});

specify("multipart_insert:teardown", timeout, function (assert) {
  nano.db.destroy("multipart_insert", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));
