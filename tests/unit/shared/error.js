'use strict';

var helpers = require('../../helpers/unit');
var test  = require('tape');
var debug = require('debug')('nano/tests/unit/shared/error');

var cli = helpers.mockClientFail(debug);
var cli2 = helpers.mockClientUnparsedError(debug);
var cli3 = helpers.mockClientUnparsedError(debug, JSON.stringify({
  error: 'not a reason'
}));

var cli4 = helpers.mockClientUnparsedError(debug, JSON.stringify({
  stack: new Error('foo').stack
}));

test('it should be able to set a jar box', function(assert) {
  cli.relax({}, function(err) {
    assert.equal(err.message, 'error happened in your connection');
    assert.end();
  });
});

test('should be able to deal with html errors bad couches', function(assert) {
  cli2.relax({}, function(err) {
    assert.equal(err.message, '<b> Error happened </b>');
    assert.end();
  });
});

test('should be capable of using `error`', function(assert) {
  cli3.relax({}, function(err) {
    assert.equal(err.message, 'not a reason');
    assert.end();
  });
});

test('should remove cloudant stacktraces', function(assert) {
  cli4.relax({}, function(err) {
    var msg = err.stack.split('\n')[0];
    assert.notEqual(msg, 'Error: foo');
    assert.equal(msg, 'Error: Unspecified error');
    assert.end();
  });
});
