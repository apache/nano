var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_ge")
  , tests    = exports
  , pixel    = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA=="
  , couch
  ;

couch = nock(cfg.url)
    .put('/' + db_name('a'))
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a'),
    date: 'Fri, 02 Dec 2011 16:34:28 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/new/att', '"Hello"')
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"1-5142a2e74e1ec33e6e5b621418210283\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a') + '/new/att',
    etag: '"1-5142a2e74e1ec33e6e5b621418210283"',
    date: 'Fri, 02 Dec 2011 16:34:29 GMT',
    'content-type': 'text/plain;charset=utf-8',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/new/att?rev=1-5142a2e74e1ec33e6e5b621418210283'
    , new Buffer(pixel, 'base64').toString())
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"2-3b1f88c637fde74a486cf3ce5558b47e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a') + '/new/att',
    etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
    date: 'Fri, 02 Dec 2011 16:34:29 GMT',
    'content-type': 'text/plain;charset=utf-8',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    .get('/' + db_name('a') +  '/new/att?rev=2-3b1f88c637fde74a486cf3ce5558b47e')
    .reply(200, new Buffer(pixel, 'base64'), { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
    date: 'Fri, 02 Dec 2011 16:34:30 GMT',
    'content-type': 'image/bmp',
    'content-md5': 'Ow9j2dR0Qm58Qi3z8p2w3A==',
    'content-length': '58',
    'cache-control': 'must-revalidate',
    'accept-ranges': 'bytes' });

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
  this.t.notOk(e, 'No Error');
  var from_buffer = new Buffer(b, "binary").toString("base64");
  this.t.equal(from_buffer, pixel, 'Buffer is pixel');
};

ensure(__filename,tests,module,process.argv[2]);