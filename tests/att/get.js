var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_ge")
  , tests    = exports
  , pixel    = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA=="
  ;

function db(i) { return nano.use(db_name(i)); }

nock(cfg.url)
  .put('/'+db_name("a"))
  .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name("a"),
  date: 'Thu, 01 Dec 2011 21:39:15 GMT',
  'content-type': 'application/json',
  'content-length': '12',
  'cache-control': 'must-revalidate' });

nock(cfg.url)
  .put('/' + db_name("a") + '/new/att', '"Hello"')
  .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"1-5142a2e74e1ec33e6e5b621418210283\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name("a") + '/new/att',
  etag: '"1-5142a2e74e1ec33e6e5b621418210283"',
  date: 'Thu, 01 Dec 2011 21:39:16 GMT',
  'content-type': 'text/plain;charset=utf-8',
  'content-length': '66',
  'cache-control': 'must-revalidate' });

nock(cfg.url)
  .put('/' + db_name("a") + '/new/att?rev=1-5142a2e74e1ec33e6e5b621418210283',
  'BM:\u0000\u0000\u0000\u0000\u0000\u0000\u00006\u0000\u0000\u0000(\u0000\u0000\u0000\u0001\u0000\u0000\u0000????\u0001\u0000\u0018\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0013\u000b\u0000\u0000\u0013\u000b\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000Zm?\u0000')
  .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"2-3b1f88c637fde74a486cf3ce5558b47e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  location: cfg.url + '/' + db_name("a") + '/new/att',
  etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
  date: 'Thu, 01 Dec 2011 21:39:16 GMT',
  'content-type': 'text/plain;charset=utf-8',
  'content-length': '66',
  'cache-control': 'must-revalidate' });

nock(cfg.url)
  .get('/' + db_name("a") + '/new/att?rev=2-3b1f88c637fde74a486cf3ce5558b47e')
  .reply(200, "BM:\u0000\u0000\u0000\u0000\u0000\u0000\u00006\u0000\u0000\u0000(\u0000\u0000\u0000\u0001\u0000\u0000\u0000ÿÿÿÿ\u0001\u0000\u0018\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0013\u000b\u0000\u0000\u0013\u000b\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000Zm\u0000", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
  etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
  date: 'Thu, 01 Dec 2011 21:39:17 GMT',
  'content-type': 'image/bmp',
  'content-md5': 'Ow9j2dR0Qm58Qi3z8p2w3A==',
  'content-length': '58',
  'cache-control': 'must-revalidate',
  'accept-ranges': 'bytes' });

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
  this.t.notOk(e, 'No Error');
  var from_buffer = new Buffer(b, "binary").toString("base64");
  this.t.equal(from_buffer, pixel, 'Buffer is pixel');
  this.t.ok(couchdb.isDone(), 'Nock not done');
};

ensure(__filename,tests,module,process.argv[2]);