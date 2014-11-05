'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

var rev;

it('should insert a document', function(assert) {
  db.insert({'foo': 'baz'}, 'foobaz', function(error, foo) {
    assert.equal(error, null, 'stores foo');
    assert.equal(foo.ok, true, 'ok response');
    assert.ok(foo.rev, 'response with rev');
    rev = foo.rev;
    assert.end();
  });
});

it('should delete a document', function(assert) {
  db.destroy('foobaz', rev, function(error, response) {
    assert.equal(error, null, 'deleted foo');
    assert.equal(response.ok, true, 'ok!');
    assert.end();
  });
});
