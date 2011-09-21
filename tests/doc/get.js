var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

function db_name(i) { return "doc_ge" + i; }
function db(i) { return nano.use(db_name(i)); }

tests.get_doc = function (callback) {
  nano.db.create(db_name('a'), function () {
    db('a').insert({foo: "bar"}, "foo", function () {
      db('a').get("foo", callback);
    });
  });
};

tests.get_doc_ok = function (e,b) {
  nano.db.destroy(db_name('a'));
  this.t.notOk(e);
  this.t.ok(b._rev);
  this.t.equal(b._id, "foo");
  this.t.equal(b.foo, "bar");
};

tests.get_doc_params = function (callback) {
  nano.db.create(db_name('b'), function () {
    db('b').insert({foo: "bar"}, "foo", function () {
      db('b').insert({foo: "bar"}, "foo", function () { // Conflict, no rev
        db('b').get("foo", {revs_info: true}, callback);
      });
    });
  });
};

tests.get_doc_params_ok = function (e,b) {
  nano.db.destroy(db_name('b'));
  this.t.notOk(e);
  this.t.ok(b._revs_info);
  this.t.equal(b._id, "foo");
  this.t.equal(b.foo, "bar");
};

ensure(__filename,tests,module,process.argv[2]);