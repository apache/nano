'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var db = harness.locals.db;
var it = harness.it;

var rev;

it('should be able to insert a doc with att', function(assert) {
  var att = {
    name: 'att',
    data: 'Hello World!',
    'content_type': 'text/plain'
  };

  db.multipart.insert({'foo': 'baz'}, [att], 'foobaz', function(error, foo) {
    assert.equal(error, null, 'should have stored foobaz');
    assert.equal(foo.ok, true, 'response should be ok');
    assert.equal(foo.id, 'foobaz', 'id is foobaz');
    assert.ok(foo.rev, 'has rev');
    rev = foo.rev;
    assert.end();
  });
});

it('should be able to get the document with the attachment', function(assert) {
  db.multipart.get('foobaz', function(error, foobaz, headers) {
    assert.equal(error, null, 'should get foobaz');
    assert.ok(headers['content-type'], 'should have content type');
    assert.equal(headers['content-type'].split(';')[0], 'multipart/related');
    assert.equal(typeof foobaz, 'object', 'foobaz should be a buffer');
    assert.end();
  });
});
