'use strict';

var async = require('async');
var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;

it('creates a bunch of database replicas', function(assert) {
  var nano = this.nano;
  var db = this.db;

  async.forEach(['db_replica', 'db_replica2'],
    nano.db.create, function(error) {
    assert.equal(error, undefined, 'created database(s)');
    async.parallel([
      function(cb) { db.insert({'foo': 'bar'}, 'foobar', cb); },
      function(cb) { db.insert({'bar': 'foo'}, 'barfoo', cb); },
      function(cb) { db.insert({'foo': 'baz'}, 'foobaz', cb); }
    ], function(error) {
      assert.equal(error, undefined, 'stores docs');
      assert.end();
    });
  });
});

it('should be able to replicate three docs', function(assert) {
  var db = this.db;
  var replica = this.nano.use('db_replica');

  db.replicate('db_replica', function(error) {
    assert.equal(error, null, 'replication should work');
    replica.list(function(error, list) {
      assert.equal(error, null, 'should be able to invoke list');
      assert.equal(list['total_rows'], 3, 'and have three documents');
      assert.end();
    });
  });
});

it('should be able to replicate to a `nano` object', function(assert) {
  var nano = this.nano;
  var db = this.db;
  var replica2 = this.nano.use('db_replica2');

  nano.db.replicate(db, replica2, function(error) {
    assert.equal(error, null, 'should replicate');
    replica2.list(function(error, list) {
      assert.equal(error, null, 'should list');
      assert.equal(list['total_rows'], 3, 'and have three documents');
      assert.end();
    });
  });
});

it('should destroy the extra databases', function(assert) {
  var nano = this.nano;
  async.forEach(['db_replica', 'db_replica2'],
  nano.db.destroy, function(error) {
    assert.equal(error, undefined, 'deleted databases');
    assert.end();
  });
});
