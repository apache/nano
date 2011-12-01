var ensure   = require('ensure')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_de")
  , tests    = exports
  , nock     = require('nock')
  , couchdb
  ;
  
  path = '/' + db_name("a");
  location = cfg.url + path;
  couchdb  = nock(cfg.url)
    .put('/' + db_name("a")
        , ''
        , { 'content-type': 'application/json'
          , "accept": 'application/json' })
    .reply(201, { ok: true },
      { location: cfg.url + '/' + db_name("a")
      , date: 'Wed, 30 Nov 2011 15:21:58 GMT'
      , 'content-type': 'application/json'
      , 'cache-control': 'must-revalidate'
      , 'status-code': 201 
      })
      
    .put(path + '/new/att', "\"Hello World!\"")
    .reply(201, { ok: true, id: 'new', rev: '1-921bd51ccdef5ab4c84b07bab7b80e7e' },
      { location: location + '/new/att'
      , date: 'Wed, 30 Nov 2011 15:21:58 GMT'
      , 'content-type': 'application/json'
      , 'cache-control': 'must-revalidate'
      , 'status-code': 201 
      })
      
     .delete(path + '/new/att?rev=1-921bd51ccdef5ab4c84b07bab7b80e7e')
     .reply(201, { ok: true, id:'new' },
       { location: location + '/new/att?rev=1-921bd51ccdef5ab4c84b07bab7b80e7e'
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
  //nano.db.destroy(db_name("a"));
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.equal(b.id, "new");
  this.t.ok(couchdb.isDone(), 'nock not done');
};

ensure(__filename,tests,module,process.argv[2]);