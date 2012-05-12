var specify  = require('specify')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  , pixel    = helpers.pixel
  ;

var mock = nock(helpers.couch, "att/get");

specify("att_get:setup", timeout, function (assert) {
  nano.db.create("att_get", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("att_get:pixelAtt", timeout, function (assert) {
  var db     = nano.use("att_get")
    , buffer = new Buffer(pixel, 'base64')
    ;

    db.attachment.insert("new", "att", "Hello", "text/plain", 
    function(error, hello) {
      assert.equal(error, undefined, "Should store hello");
      assert.equal(hello.ok, true, "Response should be ok");
      assert.ok(hello.rev, "Should have a revision number");
      db.attachment.insert("new", "att", buffer, "image/bmp", 
      { rev: hello.rev }, function (error, bmp) {
        assert.equal(error, undefined, "Should store the pixel");
        db.attachment.get("new", "att", {rev: bmp.rev}, 
        function (error, bmp) {
          assert.equal(error, undefined, "Should get the pixel");
          assert.equal(bmp.toString("base64"), pixel, "Base64 is reflexive");
        });
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