'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var it = harness.it;
var db = harness.locals.db;

it('should create a ddoc and insert some docs', helpers.prepareAView);

it('should get the people by running the ddoc', function(assert) {
  db.viewWithList('people', 'by_name_and_city', 'my_list', {
    key: [
      'Derek',
      'San Francisco'
    ]
  }, function(error, list) {
    assert.equal(error, null, 'should response');
    assert.equal(list, 'Hello', 'and list should be `hello`');
    assert.end();
  });
});
