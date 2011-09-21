var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

function db_name(i) { return "doc_up" + i; }
function db(i) { return nano.use(db_name(i)); }

tests.update_doc = function (callback) {
  nano.db.create(db_name('a'), function () {
    db('a').insert({foo: "bar"}, "foo", function (_,b) {
      db('a').insert({"_rev": b.rev, foo: "baz"}, "foo", callback);
    });
  });
};

tests.update_doc_ok = function (e,b) {
  nano.db.destroy(db_name('a'));
  this.t.notOk(e);
  this.t.equal(b.id, "foo");
  this.t.ok(b.ok);
  this.t.ok(b.rev);
};

ensure(__filename,tests,module,process.argv[2]);