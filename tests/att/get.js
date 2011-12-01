var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_ge")
  , tests    = exports
  , pixel    = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAP////8BABgAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAAWm2CAA=="
  , couchdb
  ;

  couchdb  = nock(cfg.url)
    .put('/' + db_name("a")
        , ''
        , { 'content-type': 'application/json'
          , "accept": 'application/json' })
    .reply(201, { ok: true },
      { location: cfg.url + '/' + db_name("a")
      , date: 'Wed, 30 Nov 2011 17:37:26 GMT'
      , 'content-type': 'application/json'
      , 'cache-control': 'must-revalidate'
      , 'status-code': 201 
      })

    .put('/' + db_name("a") + '/new/att'
        , "\"Hello World!\""
        , { 'content-type': 'text/plain' })
    .reply(201, { ok: true, id: 'new', rev: '1-5142a2e74e1ec33e6e5b621418210283' },
      { location: cfg.url + '/' + db_name("a") + '/new/att'
      , etag: '1-5142a2e74e1ec33e6e5b621418210283'
      , date: 'Wed, 30 Nov 2011 17:37:27 GMT'
      , 'content-type': 'application/json'
      , 'cache-control': 'must-revalidate'
      , 'status-code': 201 
      })

    .put('/' + db_name("a") +
        '/new/att?rev=1-5142a2e74e1ec33e6e5b621418210283'
      , new Buffer(pixel, 'base64')
      , { 'content-type': 'image/bmp' })
    .reply(201,   { ok: true, id: 'new'
        , rev: '2-3b1f88c637fde74a486cf3ce5558b47e' }
      , { location: 'http://nodejsbug.iriscouch.com/v061_att_gea/new/att',
          etag: '"2-3b1f88c637fde74a486cf3ce5558b47e"',
          date: 'Wed, 30 Nov 2011 17:37:27 GMT',
          'content-type': 'text/plain;charset=utf-8',
          'cache-control': 'must-revalidate',
          'status-code': 201 })

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
  this.t.notOk(e);
  var from_buffer = new Buffer(b, "binary").toString("base64");
  this.t.equal(from_buffer, pixel);
};

ensure(__filename,tests,module,process.argv[2]);