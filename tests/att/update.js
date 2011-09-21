var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports;

function db_name(i) { return "att_up" + i; }
function db(i) { return nano.use(db_name(i)); }

tests.att_doc = function (callback) {
  var pixel  = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA=="
    , buffer = new Buffer(pixel, 'base64');
  nano.db.create(db_name("b"), function () {
    db("b").attachment.insert("new", "att", "Hello World!", "text/plain",
      function (e,b) {
        if(e) { callback(e); }
        db("b").attachment.insert("new", "att", buffer, "image/bmp", {rev: b.rev},
          callback);
    });
  });
};

tests.att_doc_ok = function (e,b) {
  nano.db.destroy(db_name("b"));
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.equal(b.id, "new");
};

ensure(__filename,tests,module,process.argv[2]);