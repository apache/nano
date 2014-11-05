'use strict';

var async = require('async');
var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var nano = harness.locals.nano;

it('should be able to create `az09_$()+-/` database', function(assert) {
  nano.db.create('az09_$()+-/', function(err) {
    assert.equal(err, null, 'should create database');
    assert.end();
  });
});

it('should be able to use config from a nano object to create a db',
function(assert) {
  var config = helpers.Nano(
    helpers.couch + '/' + encodeURIComponent('with/slash')).config;
  helpers.Nano(config.url).db.create(config.db, function(err) {
    assert.equal(err, null, 'should create database');
    assert.end();
  });
});

it('must destroy the databases we created', function(assert) {
  async.forEach(['az09_$()+-/', 'with/slash'], nano.db.destroy, function(err) {
    assert.equal(err, undefined, 'should destroy all dbs');
    assert.end();
  });
});
