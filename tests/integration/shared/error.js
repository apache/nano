'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var nano = harness.locals.nano;
var Nano = helpers.Nano;
var it = harness.it;

it('should throw when initialize fails', function(assert) {
  try {
    Nano('Not a url');
  } catch (err) {
    assert.ok(err, 'should have throw');
    assert.ok(err.message, 'with a description');
  }
  try {
    Nano({});
  } catch (err2) {
    assert.ok(err2, 'should have throw');
    assert.ok(err2.message, 'with a message');
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

it('should error when destroying a db that does not exist', function(assert) {
  nano.db.destroy('say_wat_wat', function(error) {
    assert.ok(error, 'an error');
    assert.ok(error.message, 'a note');
    assert.equal(error.message, 'missing', 'is missing');
    assert.end();
  });
});
