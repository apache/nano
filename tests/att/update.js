var vows     = require('vows')
  , assert   = require('assert')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg);

function db_name(i) { return "att_up" + i; }
function db(i) { return nano.use(db_name(i)); }

/*****************************************************************************
 * att_doc                                                                   *
 *****************************************************************************/
function att_doc(callback) {
  var pixel  = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA=="
    , buffer = new Buffer(pixel, 'base64');
  nano.db.create(db_name("b"), function () {
    db("b").attachment.insert("new", "att", "Hello World!", "text/plain", 
      function (e,_,b) {
        if(e) { callback(e); }
        db("b").attachment.insert("new", "att", buffer, "image/bmp", {rev: b.rev},
          callback);
    });
  });
}

function att_doc_ok(e,h,b) {
  nano.db.destroy(db_name("b"));
  assert.isNull(e);
  assert.ok(b.ok);
  assert.equal(b.id, "new");
}

vows.describe('attachment.update').addBatch({
  "att_doc": {
    topic: function () { att_doc(this.callback); }
  , "=": att_doc_ok }
}).exportTo(module);