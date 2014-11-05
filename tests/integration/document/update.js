'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var db = harness.locals.db;
var it = harness.it;

var rev;

it('should insert one doc', function(assert) {
  db.insert({'foo': 'baz'}, 'foobar', function(error, foo) {
    assert.equal(error, null, 'stored foo');
    assert.equal(foo.ok, true, 'response ok');
    assert.ok(foo.rev, 'withs rev');
    rev = foo.rev;
    assert.end();
  });
});

it('should update the document', function(assert) {
  db.insert({foo: 'bar', '_rev': rev}, 'foobar', function(error, response) {
    assert.equal(error, null, 'should have deleted foo');
    assert.equal(response.ok, true, 'response should be ok');
    assert.end();
  });
});
