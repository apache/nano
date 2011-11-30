var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_de")
  , tests    = exports
  , nock     = require('nock')
  , couchdb  = nock(cfg.url)
                 .put( '/' + db_name("a")
                     , ''
                     , { 'content-type': 'application/json'
                       , "accept": 'application/json' })
                 .reply(201, { ok: true },
                   { location: 'http://nodejsbug.iriscouch.com/v061_att_dea'
                   , date: 'Wed, 30 Nov 2011 15:21:58 GMT'
                   , 'content-type': 'application/json'
                   , 'cache-control': 'must-revalidate'
                   , 'status-code': 201 
                   })
  ;

function db(i) { return nano.use(db_name(i)); }

tests.att_des = function (callback) {
  nano.db.create(db_name("a"), function () {
    db("a").attachment.insert("new", "att", "Hello World!", "text/plain",
      function (e,b) {
        db("a").attachment.destroy("new", "att", b.rev, callback);
    });
  });
};

tests.att_des_ok = function (e,b) {
  nano.db.destroy(db_name("a"));
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.equal(b.id, "new");
  couchdb.done();
};

ensure(__filename,tests,module,process.argv[2]);