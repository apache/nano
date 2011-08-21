var vows      = require('vows')
  , fs        = require('fs')
  , assert    = require('assert')
  , cfg       = require('../../cfg/tests.js')
  , nano      = require('../../nano')(cfg)
  , pixel     = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA==";

function db_name(i) { return "att_pi" + i; }
function db(i) { return nano.use(db_name(i)); }
function file_name(i) { return  __dirname + "/." + i + "-tmp.bmp"; }
function f_s(i) { return fs.createWriteStream(file_name(i)); }

/*****************************************************************************
 * att_pipe                                                                  *
 *****************************************************************************/
function att_pipe(callback) {
  var buffer      = new Buffer(pixel, 'base64')
    , file_stream = f_s("a");
  file_stream.on("close", function() { callback(); });
  nano.db.create(db_name("a"), function () {
    db("a").attachment.insert("new", "att", "Hello", "text/plain",
      function(e,_,b) {
        if(e) { callback(e); }
        db("a").attachment.insert("new", "att", buffer, "image/bmp", {rev: b.rev},
          function (e2,_,b2) {
          if(e2) { callback(e2); }
          db("a").attachment.get("new", "att", {rev: b2.rev}).pipe(file_stream);
        });
    });
  });
}

function att_pipe_ok() {
  nano.db.destroy(db_name("a"));
  assert.equal(fs.readFileSync(file_name("a")).toString("base64"), pixel);
  //fs.deleteFileSync(file_name("a"));
}

vows.describe('attachment.pipe').addBatch({
  "att_pipe": {
    topic: function () { att_pipe(this.callback); }
  , "=": att_pipe_ok }
}).exportTo(module);