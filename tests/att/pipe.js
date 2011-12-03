var ensure    = require('ensure')
  , nock      = require('nock')
  , fs        = require('fs')
  , cfg       = require('../../cfg/tests.js')
  , nano      = require('../../nano')(cfg)
  , tests     = exports
  , db_name  = require('../utils').db_name("att_pi")
  , pixel     = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA=="
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('a'))
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a'),
    date: 'Fri, 02 Dec 2011 19:06:26 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/new/att', '"Hello"')
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"1-5142a2e74e1ec33e6e5b621418210283\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a') + '/new/att',
    etag: '"1-5142a2e74e1ec33e6e5b621418210283"',
    date: 'Fri, 02 Dec 2011 19:06:26 GMT',
    'content-type': 'text/plain;charset=utf-8',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    .put( '/' + db_name('a') +
           '/new/att?rev=1-5142a2e74e1ec33e6e5b621418210283'
        , new Buffer(pixel, 'base64').toString())
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"2-3b1f88c637fde74a486cf3ce5558b47e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('a') + '/new/att',
    etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
    date: 'Fri, 02 Dec 2011 19:06:27 GMT',
    'content-type': 'text/plain;charset=utf-8',
    'content-length': '66',
    'cache-control': 'must-revalidate' })
    .get('/' + db_name('a') + 
           '/new/att?rev=2-3b1f88c637fde74a486cf3ce5558b47e')
    .reply(200, new Buffer(pixel, 'base64'), 
    { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
    date: 'Fri, 02 Dec 2011 19:06:27 GMT',
    'content-type': 'image/bmp',
    'content-md5': 'Ow9j2dR0Qm58Qi3z8p2w3A==',
    'content-length': '58',
    'cache-control': 'must-revalidate',
    'accept-ranges': 'bytes' });

function db(i) { return nano.use(db_name(i)); }
function file_name(i) { return  __dirname + "/." + i + "-tmp.bmp"; }
function f_s(i) { return fs.createWriteStream(file_name(i)); }

tests.att_pipe = function (callback) {
  var buffer      = new Buffer(pixel, 'base64')
    , file_stream = f_s("a");
  file_stream.on("close", function() { callback(); });
  nano.db.create(db_name("a"), function () {
    db("a").attachment.insert("new", "att", "Hello", "text/plain",
      function(e,b) {
        if(e) { callback(e); }
        db("a").attachment.insert("new", "att", buffer, "image/bmp", {rev: b.rev},
          function (e2,b2) {
          if(e2) { callback(e2); }
          db("a").attachment.get("new", "att", {rev: b2.rev}).pipe(file_stream);
        });
    });
  });
};

tests.att_pipe_ok = function () {
  this.t.equal(fs.readFileSync(file_name("a")).toString("base64"), pixel);
  fs.unlinkSync(file_name("a"));
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);