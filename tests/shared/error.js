'use strict';

var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var nano = harness.locals.nano;
var db = harness.locals.db;
var Nano = helpers.Nano;
var it = harness.it;

it('should throw when initialize fails', function(assert) {
  try {
    Nano('Not a File');
  } catch (err) {
    assert.ok(err, 'should have throw');
    assert.ok(err.message, 'with a description');
    assert.equal(err.errid, 'bad_file', 'and an error id');
    assert.equal(err.scope, 'init', 'and scope');
  }
  try {
    Nano({});
  } catch (err2) {
    assert.ok(err2, 'should have throw');
    assert.ok(err2.message, 'with a message');
    assert.equal(err2.errid, 'bad_url', 'and error id');
    assert.equal(err2.scope, 'init', 'and scope');
  }
  assert.end();
});

it('should be able to stream the simplest request', function(assert) {
  var root = nano.request();
  root.on('end', function() {
    assert.pass('request worked');
    assert.end();
  });
});

it('should get an error when streaming with bad params', function(assert) {
  var stream = db.list('bad params');
  stream.on('error', function(error) {
    assert.ok(error.message, 'msg');
    assert.equal(error.errid, 'bad_params', 'id');
    assert.equal(error.scope, 'nano', 'and scope');
    assert.end();
  });
});

it('should give an error with bad params on callback', function(assert) {
  db.list('bad params', function(error) {
    assert.ok(error.message, 'a message');
    assert.equal(error.errid, 'bad_params', 'and a code');
    assert.equal(error.scope, 'nano', 'and a scope');
    assert.end();
  });
});

it('should error when destroying a db that does not exist', function(assert) {
  nano.db.destroy('say_wat_wat', function(error) {
    assert.ok(error, 'an error');
    assert.ok(error.message, 'a note');
    assert.equal(error.description, 'missing', 'is missing');
    assert.end();
  });
});
