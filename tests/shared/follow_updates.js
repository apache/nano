var specify  = require('specify')
  , async    = require('async')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "shared/follow_updates")
  , db   = nano.use("shared_follow_updates")
  , feed
  ;

specify("shared_follow_updates:setup", timeout, function (assert) {
  nano.db.create("shared_follow_updates", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

if(!process.env.NOCK) {
  // nock doesn support streaming
  // please run tests with local couchdb
  specify("shared_follow_updates:stream", timeout, function (assert) {
    assert.expect(2);
    nano.db.destroy('mydb', function() {
      feed  = nano.follow_updates();
      feed.on('change', function (change) {
        assert.ok(change, "Change existed");
        assert.equal(change.db_name, 'mydb', "db_name is set correctly");
      });
      feed.follow();
      feed.on('wait', function() {
        nano.db.create('mydb');
      });
    });
  });
  
  specify("shared_follow_updates:callback", timeout, function (assert) {
    nano.db.destroy('mydb', function() {
      var feed = nano.follow_updates(function (error, change) {
        assert.equal(error, undefined, "No errors happened");
        assert.ok(change, "Change existed");
      });
      feed.on('wait', function() {
        nano.db.create('mydb');
      });
    });
  });
}

specify("shared_follow_updates:teardown", timeout, function (assert) {
  if (feed && typeof feed.stop === "function") {
    feed.stop();
  }
  nano.db.destroy("shared_follow_updates", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));
