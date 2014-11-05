'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

it('should be able to insert a new plain text attachment', function(assert) {
  db.attachment.insert('new',
  'att', 'Hello World!', 'text/plain', function(error, att) {
    assert.equal(error, null, 'store the attachment');
    assert.equal(att.ok, true, 'response ok');
    assert.ok(att.rev, 'have a revision number');
    db.attachment.destroy('new', 'att', {rev: att.rev},
    function(error, response) {
      assert.equal(error, null, 'delete the attachment');
      assert.equal(response.ok, true, 'response ok');
      assert.equal(response.id, 'new', '`id` should be `new`');
      assert.end();
    });
  });
});

it('should fail destroying with a bad filename', function(assert) {
  db.attachment.destroy('new', false, true, function(error, response) {
    assert.equal(response, undefined, 'no response should be given');
    assert.end();
  });
});
