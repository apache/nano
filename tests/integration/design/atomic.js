'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

var rev;

it('should be able to insert an atomic design doc', function(assert) {
  db.insert({
    updates: {
      inplace: function(doc, req) {
        var body = JSON.parse(req.body);
        doc[body.field] = body.value;
        return [doc, JSON.stringify(doc)];
      }
    }
  }, '_design/update', function(err) {
    assert.equal(err, null, 'should be no problems officer');
    db.insert({'foo': 'baz'}, 'foobar', function(error, foo) {
      assert.equal(error, null, 'stores teh foo');
      assert.equal(foo.ok, true, 'does not have an attitude');
      assert.ok(foo.rev, 'got the revisions');
      rev = foo.rev;
      assert.end();
    });
  });
});

it('should be able to insert atomically', function(assert) {
  db.atomic('update', 'inplace', 'foobar', {
    field: 'foo',
    value: 'bar'
  }, function(error, response) {
    assert.equal(error, null, 'should be able to update');
    assert.equal(response.foo, 'bar', 'and the right value was set');
    assert.end();
  });
});

it('should be able to update with slashes on the id', function(assert) {
  db.insert({'wat': 'wat'}, 'wat/wat', function(error, foo) {
    assert.equal(error, null, 'stores `wat`');
    assert.equal(foo.ok, true, 'response ok');
    db.atomic('update', 'inplace', 'wat/wat', {
      field: 'wat',
      value: 'dawg'
    }, function(error, response) {
      assert.equal(error, null, 'should update');
      assert.equal(response.wat, 'dawg', 'with the right copy');
      assert.end();
    });
  });
});
