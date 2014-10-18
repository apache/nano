'use strict';

var helpers = require('../helpers');
var harness = helpers.harness(__filename);
var it = harness.it;
var nano = harness.locals.nano;

it('should be able to track updates in couch', function(assert) {
  var once = false;
  nano.db.destroy('mydb', function() {
    nano.updates(function(err, updates) {
      if (once) {
        return;
      }
      once = true;
      //
      // older couches
      //
      if (err && updates.error && updates.error === 'illegal_database_name') {
        assert.expect(1);
        assert.ok(updates.ok, 'db updates are not supported');
        assert.end();
      }
      //
      // new couches
      //
      else {
        assert.equal(err, null, 'got root');
        assert.ok(updates.ok, 'updates are ok');
        assert.equal(updates.type, 'created', 'update was a create');
        assert.equal(updates['db_name'], 'mydb', 'mydb was updated');
        assert.end();
      }
    });

    nano.db.create('mydb');
  });
});
