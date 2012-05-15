var specify  = require("specify")
  , helpers  = require("../helpers")
  , timeout  = helpers.timeout
  , Nano     = helpers.Nano
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "shared/cookie")
  ;

specify("shared_cookie:setup", timeout, function (assert) {
  console.log()
  nano.db.create("shared_cookie", function (err) {
    assert.equal(err, undefined, "Failed to create database");
  });
});

specify("shared_cookie:test", timeout, function (assert) {
  db = Nano({ url : "http://localhost:5984", cookie: "abc123" }).use("shared_cookie");
  db.insert({"foo": "bar"}, null, function (error, response) {
    assert.equal(response.request.headers['X-CouchDB-WWW-Authenticate'], "Cookie", 
      "Request header 'X-CouchDB-WWW-Authenticate' was missing");
    assert.equal(response.request.headers['cookie'], "abc123", 
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