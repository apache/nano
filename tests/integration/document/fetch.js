'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var db = harness.locals.db;
var it = harness.it;

it('should insert a bunch of items', helpers.insertThree);

it('should be able to fetch with one key', function(assert) {
  db.fetch({keys:['foobar']}, function(error, docs) {
    assert.equal(error, null, 'should work');
    assert.equal(docs.rows.length, 1, 'and get one row');
    assert.equal(docs['total_rows'], 3, 'out of 3');
    assert.end();
  });
});

it('should be able to fetch with multiple keys', function(assert) {
  db.fetch({keys:['foobar', 'barfoo']}, function(error, docs) {
    assert.equal(error, null, 'no errors');
    assert.equal(docs.rows.length, 2, 'two rows');
    assert.equal(docs['total_rows'], 3, 'out of 3');
    assert.end();
  });
});

it('should be able to fetch with params', function(assert) {
  db.fetch({keys:['foobar']}, {not: 'important'}, function(error, docs) {
    assert.equal(error, null, 'should work');
    assert.equal(docs.rows.length, 1, 'and get one row');
    assert.equal(docs['total_rows'], 3, 'out of 3');
    assert.end();
  });
});
