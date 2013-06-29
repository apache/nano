var specify  = require('specify')
  , async    = require('async')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "design/list")
  , db   = nano.use("design_list")
  ;

specify("design_list:setup", timeout, function (assert) {
  nano.db.create("design_list", function (err) {
    assert.equal(err, undefined, "Failed to create database");
    db.insert(
    { "views":
      { "by_name_and_city":
        { "map": function(doc) { emit([doc.name, doc.city], doc._id); } }
      },
      "lists": { "my_list": function(head, req) { send('Hello'); } }
    }, '_design/people', function (error, response) {
      assert.equal(error, undefined, "Failed to create views");
      assert.equal(response.ok, true, "Response should be ok");
      async.parallel(
        [ function(cb) { db.insert(
            { name: "Derek", city: "San Francisco" }, "p_derek", cb); }
        , function(cb) { db.insert(
            { name: "Randall", city: "San Francisco" }, "p_randall", cb); }
        , function(cb) { db.insert(
            { name: "Nuno", city: "New York" }, "p_nuno", cb); }
        ]
      , function(error, results) {
        assert.equal(error, undefined, "Should have stored docs");
      });
    });
  });
});

specify("design_list:test", timeout, function (assert) {
  db.view_with_list('people','by_name_and_city', 'my_list',
  {key: ["Derek","San Francisco"]}, function (error, list) {
    assert.equal(error, undefined, "View didn't respond");
    assert.equal(list,"Hello");
  });
});

specify("design_list:teardown", timeout, function (assert) {
  nano.db.destroy("design_list", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));
