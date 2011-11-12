var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_de")
  , tests    = exports
  ;

function db(i) { return nano.use(db_name(i)); }

tests.att_des = function (callback) {
  nano.db.create(db_name("a"), function () {
    db("a").attachment.insert("new", "att", "Hello World!", "text/plain",
      function (e,b) {
        db("a").attachment.destroy("new", "att", b.rev, callback);
    });
  });
};

tests.att_des_ok = function (e,b) {
  nano.db.destroy(db_name("a"));
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.equal(b.id, "new");
};

ensure(__filename,tests,module,process.argv[2]);