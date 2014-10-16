'use strict';

var helpers = require('../helpers');
var harness = helpers.harness();
var it = harness.it;

it('should be able to insert a simple attachment', function(assert) {
  this.db.attachment.insert('new', 'att', 'Hello World!', 'text/plain',
  function(error, att) {
    assert.equal(error, null, 'should store the attachment');
    assert.equal(att.ok, true, 'response ok');
    assert.ok(att.rev, 'should have a revision');
    assert.end();
  });
});
