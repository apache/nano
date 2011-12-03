var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .get('/acb')
    .reply(404, "{\"error\":\"not_found\",\"reason\":\"no_db_file\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    date: 'Fri, 02 Dec 2011 02:53:14 GMT',
    'content-type': 'application/json',
    'content-length': '44',
    'cache-control': 'must-revalidate' })
    .get('/adb')
    .reply(404, "{\"error\":\"not_found\",\"reason\":\"no_db_file\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    date: 'Fri, 02 Dec 2011 02:53:14 GMT',
    'content-type': 'application/json',
    'content-length': '44',
    'cache-control': 'must-revalidate' })
    .get('/adb')
    .reply(404, "{\"error\":\"not_found\",\"reason\":\"no_db_file\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    date: 'Fri, 02 Dec 2011 02:53:14 GMT',
    'content-type': 'application/json',
    'content-length': '44',
    'cache-control': 'must-revalidate' })
    .get('/a')
    .reply(404, "{\"error\":\"not_found\",\"reason\":\"no_db_file\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    date: 'Fri, 02 Dec 2011 02:53:14 GMT',
    'content-type': 'application/json',
    'content-length': '44',
    'cache-control': 'must-revalidate' });

tests.url = function (callback) { callback(null,nano('http://someurl.com')); };
tests.url_ok = function (_,n) { this.t.equal(n.config.url, "http://someurl.com"); };

tests.url2 = function (callback) { callback(null,nano('http://someurl.com/')); };
tests.url2_ok = function (_,n) { this.t.equal(n.config.url, "http://someurl.com/"); };

tests.url_db = function (callback) { nano(cfg.url + "/adb").info(callback); };
tests.url_db_ok = function (e,b) {
  this.t.equal(e.message,"no_db_file");
  this.t.equal(e.error, "not_found");
  this.t.equal(e.request.uri, (cfg.url + '/adb'));
};

tests.url_db2 = function (callback) { nano(cfg.url + "/acb/").info(callback); };
tests.url_db2_ok = function (e,b) {
  this.t.equal(e.message,"no_db_file");
  this.t.equal(e.error, "not_found");
  this.t.equal(e.request.uri, (cfg.url + '/acb'));
};

tests.url_db3 = function (callback) { nano(cfg.url + "/adb/blergh").info(callback); };
tests.url_db3_ok = function (e,b) {
  this.t.equal(e.message,"no_db_file");
  this.t.equal(e.error, "not_found");
  this.t.equal(e.request.uri, (cfg.url + '/adb'));
};

tests.url_db4 = function (callback) { nano(cfg.url + "/a/b/d/c/").info(callback); };
tests.url_db4_ok = function (e,b) {
  this.t.equal(e.message,"no_db_file");
  this.t.equal(e.error, "not_found");
  this.t.equal(e.request.uri, (cfg.url + '/a'));
};

tests.file = function (callback) { callback(null,nano(__dirname+ '/../../cfg/tests.js')); };
tests.file_ok = function (_,n) {  this.t.equal(n.config.url, cfg.url); };

tests.bad_file = function (callback) { callback(null,nano('notafile')); };
tests.bad_file_ok = function (_,e) { this.t.equal(e.config.url,"http://localhost:5984"); };

tests.obj_cfg = function (callback) { callback(null,nano(cfg)); };
tests.obj_cfg_ok = function (_,n) { this.t.equal(n.config.url, cfg.url); };

tests.not_string_or_object = function (callback) { callback(null,nano(false)); };
tests.not_string_or_object_ok = function (_,e) { this.t.equal(e.config.url,"http://localhost:5984"); };

tests.nano_undefined = function (callback) { callback(null,nano()); };
tests.nano_undefined_ok = function (_,e) { this.t.equal(e.config.url,"http://localhost:5984"); };

ensure(__filename,tests,module,process.argv[2]);