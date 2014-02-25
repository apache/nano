var specify  = require('specify')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "att/get")
  , db   = nano.use("att_get")
  ;


specify("att_get:setup", timeout, function (assert) {
  nano.db.create("att_get", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("att_get:test_string", timeout, function (assert) {
  db.attachment.insert("new_string", "att", "Hello", "text/plain", 
  function(error, hello) {
    assert.equal(error, undefined, "Should store hello");
    assert.equal(hello.ok, true, "Response should be ok");
    assert.ok(hello.rev, "Should have a revision number");
    db.attachment.get("new_string", "att", 
    function (error, helloWorld) {
      assert.equal(error, undefined, "Should get the hello");
      assert.equal("Hello", helloWorld, "string is reflexive");
    });
  });
});

specify("att_get:test_binary", timeout, function (assert) {
  db.attachment.insert("new_binary", "att", new Buffer("123"), "text/plain", 
  function(error, hello) {
    assert.equal(error, undefined, "Should store 123");
    assert.equal(hello.ok, true, "Response should be ok");
    assert.ok(hello.rev, "Should have a revision number");
    db.attachment.get("new_binary", "att", 
    function (error, binaryData) {
      assert.equal(error, undefined, "Should get the binary data");
      assert.equal("123", binaryData, "binary data is reflexive");
    });
  });
});

specify("att_get:teardown", timeout, function (assert) {
  nano.db.destroy("att_get", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));