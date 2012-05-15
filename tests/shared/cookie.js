var specify  = require("specify")
  , helpers  = require("../helpers")
  , timeout  = helpers.timeout
  , Nano     = helpers.Nano
  , nock     = helpers.nock
  , nano     = Nano({ url : helpers.couch, cookie: "abc123" })
  ;

var mock = nock(helpers.couch, "shared/cookie")
  , db   = nano.use("shared_cookie")
  ;

specify("shared_cookie:setup", timeout, function (assert) {
  nano.db.create("shared_cookie", function (error, response, headers) {
    console.log(headers)
    assert.equal(error, undefined, "Failed to create database");
    assert.equal(response.request.headers.cookie, "abc123", 
      "Cookie not sent in request headers");
  });
});

specify("shared_cookie:test", timeout, function (assert) {
  db.insert({"foo": "bar"}, null, function (error, response, headers) {
    console.log(headers)
    assert.equal(response.request.headers['X-CouchDB-WWW-Authenticate'],
      "Cookie", "Request header 'X-CouchDB-WWW-Authenticate' was missing");
    assert.equal(response.request.headers.cookie, "abc123", 
      "Cookie not sent in request headers");
  });
});

specify("shared_cookie:teardown", timeout, function (assert) {
  nano.db.destroy("shared_cookie", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));