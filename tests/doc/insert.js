var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

function db_name(i) { return "doc_in" + i; }
function db(i) { return nano.use(db_name(i)); }

tests.insert_doc = function (callback) {
  nano.db.create(db_name("a"), function () {
    db("a").insert({foo: "bar"}, callback);
  });
};

tests.insert_doc_ok = function (e,b) {
  nano.db.destroy(db_name("a"));
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.ok(b.rev);
  this.t.ok(b.id);
};

tests.insert_doc_path = function (callback) {
  nano.db.create(db_name("b"), function () {
    db("b").insert({foo: "bar"}, 'some/path', callback);
  });
}

tests.insert_doc_path_ok = function (e,b) {
  nano.db.destroy(db_name("b"));
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.ok(b.rev);
  this.t.equal(b.id, "some/path");
}

ensure(__filename,tests,module,process.argv[2]);