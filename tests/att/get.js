var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_ge")
  , tests    = exports
  , pixel    = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA=="
  ;

function db(i) { return nano.use(db_name(i)); }

tests.att_get = function (callback) {
  var buffer = new Buffer(pixel, 'base64');
  nano.db.create(db_name("a"), function () {
    db("a").attachment.insert("new", "att", "Hello", "text/plain",
      function(e,b) {
        if(e) { callback(e); }
        db("a").attachment.insert("new", "att", buffer, "image/bmp", {rev: b.rev},
          function (e2,b2) {
          if(e2) { callback(e2); }
          db("a").attachment.get("new", "att", {rev: b2.rev}, callback);
        });
    });
  });
};

tests.att_get_ok = function (e,b) {
  nano.db.destroy(db_name('a'));
  this.t.notOk(e, 'No Error');
  var from_buffer = new Buffer(b, "binary").toString("base64");
  this.t.equal(from_buffer, pixel, 'Buffer is pixel');
};

ensure(__filename,tests,module,process.argv[2]);