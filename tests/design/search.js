var specify  = require('specify')
  , async    = require('async')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

if(!process.env.NOCK) {
  specify("design_search:skip_unmocked", timeout, function (assert) {
    assert.ok(true, 'these tests only run against mocks');
  });
  return specify.run(process.argv.slice(2));
}

var mock = nock(helpers.couch, "design/search")
  , db   = nano.use("design_search")
  ;

specify("design_search:setup", timeout, function (assert) {
  nano.db.create("design_search", function (err) {
    assert.equal(err, undefined, "Failed to create database");
    db.insert(
    { "views":
      { "by_name_and_city":
        { "map": function(doc) { emit([doc.name, doc.city], doc._id); } }
      }
    }, '_design/people/_search', function (error, response) {
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

specify("design_search:test", timeout, function (assert) {
  db.search('people','by_name_and_city',
  {key: ["Derek","San Francisco"]}, function (error, view) {
    assert.equal(error, undefined, "View didn't respond");
    assert.equal(view.rows.length,1);
    assert.equal(view.rows.length,1);
    assert.equal(view.rows[0].id,'p_derek');
    assert.equal(view.rows[0].key[0],'Derek');
    assert.equal(view.rows[0].key[1],'San Francisco');
  });
});

specify("design_search:reuse_params", timeout, function (assert) {
  var opts = { key: ["Derek","San Francisco"] };
  db.search('people','by_name_and_city', opts, function(error, view) {
    assert.equal(error, undefined, "View didn't respond");
    assert.equal(view.rows.length,1);
    assert.equal(view.rows.length,1);
    assert.equal(view.rows[0].id,'p_derek');
    assert.equal(view.rows[0].key[0],'Derek');
    assert.equal(view.rows[0].key[1],'San Francisco');
  });
  db.search('people','by_name_and_city', opts, function(error, view) {
    assert.equal(error, undefined, "View didn't respond");
    assert.equal(view.rows.length,1);
    assert.equal(view.rows.length,1);
    assert.equal(view.rows[0].id,'p_derek');
    assert.equal(view.rows[0].key[0],'Derek');
    assert.equal(view.rows[0].key[1],'San Francisco');
  });
  assert.ok(Array.isArray(opts.key));
  assert.equal(opts.key[0],'Derek');
  assert.equal(opts.key[1],'San Francisco');
});

specify("design_search:teardown", timeout, function (assert) {
  nano.db.destroy("design_search", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));
