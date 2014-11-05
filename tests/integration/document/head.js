'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var db = harness.locals.db;
var it = harness.it;

it('should insert a one item', helpers.insertOne);

it('should get a status code when you do head', function(assert) {
  db.head('foobaz', function(error, body, headers) {
    assert.equal(error, null, 'should get the head of foobaz');
    assert.equal(headers['statusCode'], 200, 'and is ok');
    assert.end();
  });
});
