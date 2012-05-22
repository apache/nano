var specify    = require("specify")
  , helpers    = require("../helpers")
  , timeout    = helpers.timeout
  , nano       = helpers.nano
  , Nano       = helpers.Nano
  , nock       = helpers.nock
  ;

var mock = nock(helpers.couch, "shared/cookie")
  ,  cookie
  ,  cookie_nano
  ,  nano_admin = new Nano('http://admin:password@localhost:5984')
  ;

specify("shared_cookie:setup", timeout, function (assert) {
  nano_admin.db.create("shared_cookie", function (err, response) {
    assert.equal(err, undefined, "Failed to create database");
        nano.request({
            method: "POST",
            db: "_session",
            form: { "name" : "admin", "password" : "password" },
            content_type: "application/x-www-form-urlencoded; charset=utf-8"
          }, function (err, response, headers) {
             assert.equal(err, undefined, "Should have logged in successfully");
             assert.ok(headers['set-cookie'], "Response should have a set-cookie header");
             cookie = headers['set-cookie'];
        });
  });
});

specify("shared_cookie:test", timeout, function (assert) {
  Nano({ url : "http://localhost:5984", cookie: cookie }).use("shared_cookie")
  .insert({"foo": "baz"}, null, function (error, response) {
    assert.equal(error, undefined, "Should have stored value");
    assert.equal(response.ok, true, "Response should be ok");
    assert.ok(response.rev, "Response should have rev");
  });
});

specify("shared_cookie:teardown", timeout, function (assert) {
    nano_admin.db.destroy("shared_cookie", function (err) {
      assert.equal(err, undefined, "Failed to destroy database");
      assert.ok(mock.isDone(), "Some mocks didn't run");
    });
});

specify.run(process.argv.slice(2));