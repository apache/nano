var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_up")
  , pixel    =  "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA=="
  , tests    = exports
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('b'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b'),
        date: 'Fri, 02 Dec 2011 18:49:22 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('b') + '/new/att', '"Hello World!"')
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"1-921bd51ccdef5ab4c84b07bab7b80e7e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('b') + '/new/att',
    etag: '"1-921bd51ccdef5ab4c84b07bab7b80e7e"',
    date: 'Fri, 02 Dec 2011 18:49:23 GMT',
    'content-type': 'text/plain;charset=utf-8',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    .put( '/' + db_name('b') + '/new/att?rev=1-921bd51ccdef5ab4c84b07bab7b80e7e'
        , new Buffer(pixel, 'base64').toString())
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"2-c6d2cd80113d505ec29430ac0859b41b\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('b') + '/new/att',
    etag: '"2-c6d2cd80113d505ec29430ac0859b41b"',
    date: 'Fri, 02 Dec 2011 18:50:44 GMT',
    'content-type': 'text/plain;charset=utf-8',
    'content-length': '66',
    'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.att_doc = function (callback) {
  var buffer = new Buffer(pixel, 'base64');
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
  this.t.notOk(e, 'No errs');
  this.t.ok(b.ok, 'Ok');
  this.t.equal(b.id, "new", 'Id is new');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);