var ensure   = require('ensure')
  , assert   = require('assert')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , tests    = exports
  , pixel    = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA==";

function db_name(i) { return "att_ge" + i; }
function db(i) { return nano.use(db_name(i)); }

tests.att_get = function (callback) {
  var buffer = new Buffer(pixel, 'base64');
  nano.db.create(db_name("a"), function () {
    db("a").attachment.insert("new", "att", "Hello", "text/plain",
      function(e,b) {
        if(e) { callback(e); nano.db.destroy(db_name("a")); }
        db("a").attachment.insert("new", "att", buffer, "image/bmp", {rev: b.rev},
          function (e2,b2) {
          if(e2) { callback(e2); nano.db.destroy(db_name("a")); }
          db("a").attachment.get("new", "att", {rev: b2.rev}, callback);
        });
    });
  });
};

tests.att_get_ok = function (e,b) {
  nano.db.destroy(db_name("a"));
  assert.isNull(e);
  var from_buffer = new Buffer(b, "binary").toString("base64");
  assert.equal(from_buffer, pixel);
};

ensure(__filename,tests,module,process.argv[2]);