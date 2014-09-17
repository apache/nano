var specify  = require('specify')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , Nano     = helpers.Nano
  , couch    = helpers.couch
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "db/create");

specify("db_create:test", timeout, function (assert) {
  nano.db.create("db_create", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("db_create:encoded_name", timeout, function (assert) {
  nano.db.create("az09_$()+-/", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("db_create:encoded_name_from_config", timeout, function (assert) {
  var config = Nano(helpers.couch + "/" + encodeURIComponent("with/slash")).config;
  Nano(config.url).db.create(config.db, function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("db_create:teardown", timeout, function (assert) {
  nano.db.destroy("db_create", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    nano.db.destroy("az09_$()+-/", function (err) {
      assert.equal(err, undefined, "Failed to destroy database");
      nano.db.destroy("with/slash", function (err) {
        assert.equal(err, undefined, "Failed to destroy database");
        assert.ok(mock.isDone(), "Some mocks didn't run");
      });
    });
  });
});

specify.run(process.argv.slice(2));
