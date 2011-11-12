var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_de")
  , tests    = exports;

tests.destroy_doc = function (callback) {
  var db = nano.use(db_name('1'));
  nano.db.create(db_name('1'), function () {
    db.insert({foo: "bar"}, "foo", function (_,b) {
      db.destroy("foo", b.rev, function (e,b) {
        callback(e,b);
        return;
      });
    });
  });
};

tests.destroy_doc_ok = function (e,b) {
  nano.db.destroy(db_name('1'));
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.equal(b.id, "foo");
  this.t.ok(b.rev);
};

ensure(__filename,tests,module,process.argv[2]);