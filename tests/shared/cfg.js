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
 * url2                                                                      *
 *****************************************************************************/
function url2(callback) { callback(null,nano('http://someurl.com/')); }
function url2_ok(_,n) { assert.equal(n.config.url, "http://someurl.com/"); }

/*****************************************************************************
 * url_db                                                                    *
 *****************************************************************************/
function url_db(callback) {
  nano(cfg.db_url("adb")).info(callback);
}
function url_db_ok(e,h,b) {
  assert.equal(e.message,"no_db_file");
  assert.equal(e.error, "not_found");
  assert.equal(e.request.uri, (cfg.url + '/adb'));
}

/*****************************************************************************
 * url_db2                                                                   *
 *****************************************************************************/
function url_db2(callback) {
  nano(cfg.db_url("adb/")).info(callback);
}
function url_db2_ok(e,h,b) {
  assert.equal(e.message,"no_db_file");
  assert.equal(e.error, "not_found");
  assert.equal(e.request.uri, (cfg.url + '/adb'));
}

/*****************************************************************************
 * url_db3                                                                   *
 *****************************************************************************/
function url_db3(callback) {
  nano(cfg.db_url("adb/blergh")).info(callback);
}
function url_db3_ok(e,h,b) {
  assert.equal(e.message,"no_db_file");
  assert.equal(e.error, "not_found");
  assert.equal(e.request.uri, (cfg.url + '/adb'));
}

/*****************************************************************************
 * url_db4                                                                   *
 *****************************************************************************/
function url_db4(callback) {
  nano(cfg.db_url("a/b/d/c/")).info(callback);
}
function url_db4_ok(e,h,b) {
  assert.equal(e.message,"no_db_file");
  assert.equal(e.error, "not_found");
  assert.equal(e.request.uri, (cfg.url + '/a'));
}

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

/*****************************************************************************
 * nano_undefined                                                            *
 *****************************************************************************/
function nano_undefined(callback) {
  callback(null,nano());
}
function nano_undefined_ok(_,e) {
  assert.equal(e.config.url,"http://localhost:5984");
}

vows.describe('config').addBatch({
  "url": {
    topic: function () { url(this.callback); }
  , "=": url_ok },
  "url2": {
    topic: function () { url2(this.callback); }
  , "=": url2_ok },
  "url_db": {
    topic: function () { url_db(this.callback); }
  , "=": url_db_ok },
  "url_db2": {
    topic: function () { url_db2(this.callback); }
  , "=": url_db2_ok },
  "url_db3": {
    topic: function () { url_db3(this.callback); }
  , "=": url_db3_ok },
  "url_db4": {
    topic: function () { url_db4(this.callback); }
  , "=": url_db4_ok },
  "file": {
    topic: function () { file(this.callback); }
  , "=": file_ok },
  "bad_file": {
    topic: function () { bad_file(this.callback); }
  , "=": bad_file_ok },
  "object": {
    topic: function () { object(this.callback); }
  , "=": object_ok },
  "nano_undefined": {
    topic: function () { nano_undefined(this.callback); }
  , "=": nano_undefined_ok },
  "not_string_or_object": {
    topic: function () { not_string_or_object(this.callback); }
  , "=": not_string_or_object_ok }
}).exportTo(module);
