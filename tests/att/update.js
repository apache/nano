var specify  = require('specify')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  , pixel    = helpers.pixel
  ;

var mock = nock(helpers.couch, "att/update")
  , db   = nano.use("att_update")
  ;

specify("att_update:setup", timeout, function (assert) {
  nano.db.create("att_update", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("att_update:test", timeout, function (assert) {
  var buffer = new Buffer(pixel, 'base64');
    db.attachment.insert("new", "att", "Hello", "text/plain", 
    function(error, hello) {
      assert.equal(error, undefined, "Should store hello");
      assert.equal(hello.ok, true, "Response should be ok");
      assert.ok(hello.rev, "Should have a revision number");
      db.attachment.insert("new", "att", buffer, "image/bmp", 
      { rev: hello.rev }, function (error, bmp) {
        assert.equal(error, undefined, "Should store the pixel");
      });
    });
});

specify("att_update:teardown", timeout, function (assert) {
  nano.db.destroy("att_update", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));