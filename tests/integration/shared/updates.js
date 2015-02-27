'use strict';

var helpers = require('../../helpers/integration');
var harness = helpers.harness(__filename, helpers.noopTest, helpers.noopTest);
var it = harness.it;
var nano = harness.locals.nano;

it('should be able to track updates in couch', function(assert) {
  var called = false;

  function getUpdates() {
    nano.updates(function(err, updates) {
      if (called) {
        return;
      }
      called = true;

      if (err && updates.error && updates.error === 'illegal_database_name') {
        //
        // older couches
        //
        assert.expect(1);
        assert.ok(updates.ok, 'db updates are not supported');
        assert.end();
      } else {
        //
        // new couches
        //
        assert.equal(err, null, 'got root');
        assert.ok(updates.ok, 'updates are ok');
        assert.equal(updates.type, 'created', 'update was a create');
        assert.equal(updates['db_name'], 'mydb', 'mydb was updated');
        assert.end();
      }
    });

    setTimeout(function() { nano.db.create('mydb'); }, 50);
  }

  nano.db.destroy('mydb', getUpdates);
});

it('should destroy mydb', function(assert) {
  nano.db.destroy('mydb', function(err) {
    assert.equal(err, null, 'no errors');
    assert.end();
  });
});
