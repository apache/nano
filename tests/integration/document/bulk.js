'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

it('should be able to bulk insert two docs', function(assert) {
  db.bulk({
    'docs': [
      {'key':'baz', 'name':'bazzel'},
      {'key':'bar', 'name':'barry'}
    ]
  },
  function(error, response) {
    assert.equal(error, null, 'no error');
    assert.equal(response.length, 2, 'has two docs');
    assert.ok(response[0].id, 'first got id');
    assert.ok(response[1].id, 'other also got id');
    assert.end();
  });
});
