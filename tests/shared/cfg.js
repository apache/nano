var vows     = require('vows')
  , assert   = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano');

/*****************************************************************************
 * url                                                                       *
 *****************************************************************************/
function url(callback) { callback(null,nano('http://someurl.com')); }
function url_ok(_,n) { assert.equal(n.config.url, "http://someurl.com"); }

/*****************************************************************************
 * file                                                                      *
 *****************************************************************************/
function file(callback) { callback(null,nano(__dirname+ '/../../cfg/tests.js')); }
function file_ok(_,n) {  assert.equal(n.config.url, cfg.url); }
 
/*****************************************************************************
 * bad_file                                                                  *
 *****************************************************************************/
function bad_file(callback) { 
  callback(null,nano('notafile'));
}
function bad_file_ok(_,e) { assert.equal(e.config.url,"http://localhost:5984"); }

/*****************************************************************************
 * object                                                                    *
 *****************************************************************************/
function object(callback) { callback(null,nano(cfg)); }
function object_ok(_,n) { assert.equal(n.config.url, cfg.url); }
 
/*****************************************************************************
 * not_string_or_object                                                      *
 *****************************************************************************/
function not_string_or_object(callback) {
  callback(null,nano(false));
}
function not_string_or_object_ok(_,e) { 
  assert.equal(e.config.url,"http://localhost:5984");
}
 
vows.describe('config').addBatch({
  "url": {
    topic: function () { url(this.callback); }
  , "=": url_ok },
  "file": {
    topic: function () { file(this.callback); }
  , "=": file_ok },
  "bad_file": {
    topic: function () { bad_file(this.callback); }
  , "=": bad_file_ok },
  "object": {
    topic: function () { object(this.callback); }
  , "=": object_ok },
  "not_string_or_object": {
    topic: function () { not_string_or_object(this.callback); }
  , "=": not_string_or_object_ok }
}).exportTo(module);
