'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename);
var db = harness.locals.db;
var it = harness.it;

it('should insert a one item', helpers.insertOne);

it('should get the document', function(assert) {
  db.get('foobaz', {'revs_info': true}, function(error, foobaz) {
    assert.equal(error, null, 'should get foobaz');
    assert.ok(foobaz['_revs_info'], 'got revs info');
    assert.equal(foobaz._id, 'foobaz', 'id is food');
    assert.equal(foobaz.foo, 'baz', 'baz is in foo');
    assert.end();
  });
});
