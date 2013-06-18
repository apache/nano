var specify  = require('specify')
  , async    = require('async')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "design/search")
  , db   = nano.use("design_search")
  ;

specify("design_search:setup", timeout, function (assert) {
  nano.db.create("design_search", function (err) {
    assert.equal(err, undefined, "Failed to create database");
    db.insert(
    { "search": {
      "singleDoc": function(doc, req) {
        if(req.query.format === 'json' || !req.query.format) {
          return { body: JSON.stringify({ name: doc.name, city: doc.city, format: 'json' }), headers: { 'Content-Type': 'application/json' } };
        }
      }
    }
    }, '_design/people/_search', function (error, response) {
      assert.equal(error, undefined, "Failed to create search function");
      assert.equal(response.ok, true, "Response should be ok");
      async.parallel(
        [ function(cb) { db.insert(
            { name: "Clemens", city: "Dresden" }, "p_clemens", cb); }
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

specify("design_search:test", timeout, function (assert) {
  db.search('people','singleDoc', { q: 'p_clemens'}, function (error, doc, rh) {
    assert.equal(error, undefined, "Search function didn't respond");
    assert.equal(rh['content-type'], 'application/json');
    assert.equal(doc.name,'Clemens');
    assert.equal(doc.city,'Dresden');
    assert.equal(doc.format,'json');
  });
});

specify("design_search:teardown", timeout, function (assert) {
  nano.db.destroy("design_search", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));
