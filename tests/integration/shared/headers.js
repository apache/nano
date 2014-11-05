'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var nano = harness.locals.nano;
var db = harness.locals.db;
var it = harness.it;

it('should get headers', function(assert) {
  db.attachment.insert('new', 'att', 'Hello', 'text/plain',
  function(error, hello) {
    assert.equal(error, null, 'should store hello');
    assert.equal(hello.ok, true, 'response should be ok');
    assert.ok(hello.rev, 'should have a revision number');
    nano.request({
      db: 'shared_headers',
      doc: 'new',
      headers: {'If-None-Match': JSON.stringify(hello.rev)}
    }, function(error, helloWorld, rh) {
      assert.equal(error, null, 'should get the hello');
      assert.equal(rh['statusCode'], 304, 'status is not modified');
      nano.request({
        db: 'shared_headers',
        doc: 'new',
        att: 'att'
      }, function(error, helloWorld, rh) {
        assert.equal(error, null, 'should get the hello');
        assert.equal(rh['statusCode'], 200, 'status is `ok`');
        assert.end();
      });
    });
  });
});
