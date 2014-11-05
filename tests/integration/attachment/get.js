'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

it('should be able to fetch an attachment', function(assert) {
  db.attachment.insert('new_string', 'att', 'Hello', 'text/plain',
  function(error, hello) {
    assert.equal(error, null, 'should store `hello`');
    assert.equal(hello.ok, true, 'response ok');
    assert.ok(hello.rev, 'should have a revision number');
    db.attachment.get('new_string', 'att',
    function(error, helloWorld) {
      assert.equal(error, null, 'should get `hello`');
      assert.equal('Hello', helloWorld.toString(), 'string is reflexive');
      assert.end();
    });
  });
});

it('should insert and fetch a binary file', function(assert) {
  db.attachment.insert('new_binary', 'att', new Buffer('123'),
  'text/plain', function(error, hello) {
    assert.equal(error, null, 'should store `123`');
    assert.equal(hello.ok, true, 'response ok');
    assert.ok(hello.rev, 'should have a revision number');
    db.attachment.get('new_binary', 'att',
    function(error, binaryData) {
      assert.equal(error, null, 'should get the binary data');
      assert.equal('123', binaryData.toString(), 'binary data is reflexive');
      assert.end();
    });
  });
});
