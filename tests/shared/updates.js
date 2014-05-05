var specify  = require('specify')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , Nano     = helpers.Nano
  , nock     = helpers.nock
  , couch    = helpers.couch
  ;

var mock = nock(helpers.couch, "shared/updates");

specify("updates", timeout, function (assert) {
  nano.db.destroy('mydb', function() {
    nano.updates(function(err, updates) {
      assert.equal(err, undefined, "Failed to get root");
      assert.ok(updates.ok, 'updates are ok');
      assert.equal(updates.type, 'created', 'update was a create');
      assert.equal(updates.db_name, 'mydb', 'mydb was updated');
    });
    nano.db.create('mydb');
  });
});

specify.run(process.argv.slice(2));
