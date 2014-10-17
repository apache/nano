'use strict';

var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;

it('should create a ddoc and insert some docs', helpers.prepareAView);

it('should get the people by running the ddoc', function(assert) {
  this.db['view_with_list']('people', 'by_name_and_city', 'my_list', {
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
