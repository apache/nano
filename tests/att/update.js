'use strict';

var helpers = require('../helpers');
var pixel = helpers.pixel;
var harness = helpers.harness(__filename);
var it = harness.it;

var rev;

it('should be able to insert and update attachments', function(assert) {
  var locals = this;
  var buffer = new Buffer(pixel, 'base64');
  locals.db.attachment.insert('new', 'att', 'Hello', 'text/plain',
  function(error, hello) {
    assert.equal(error, null, 'should store hello');
    assert.equal(hello.ok, true, 'response ok');
    assert.ok(hello.rev, 'should have a revision');
    locals.db.attachment.insert('new', 'att', buffer, 'image/bmp',
    {rev: hello.rev}, function(error, bmp) {
      assert.equal(error, null, 'should store the pixel');
      assert.ok(bmp.rev, 'should store a revision');
      rev = bmp.rev;
      assert.end();
    });
  });
});

it('should be able to fetch the updated pixel', function(assert) {
  var locals = this;
  locals.db.get('new', function(error, newDoc) {
    assert.equal(error, null, 'should get new');
    newDoc.works = true;
    locals.db.insert(newDoc, 'new', function(error, response) {
      assert.equal(error, null, 'should update doc');
      assert.equal(response.ok, true, 'response ok');
      assert.end();
    });
  });
});
