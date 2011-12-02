var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("att_in")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name("a"))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)'
      , location: 'http://nodejsbug.iriscouch.com/v061_att_ina'
      , date: 'Fri, 02 Dec 2011 00:21:46 GMT'
      , 'content-type': 'application/json'
      , 'content-length': '12'
      , 'cache-control': 'must-revalidate' 
      })
    .put('/' + db_name("a") + '/new/att', '"Hello World!"')
    .reply(201, "{\"ok\":true,\"id\":\"new\",\"rev\":\"1-921bd51ccdef5ab4c84b07bab7b80e7e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
     location: 'http://nodejsbug.iriscouch.com/v061_att_ina/new/att',
     etag: '"1-921bd51ccdef5ab4c84b07bab7b80e7e"',
     date: 'Fri, 02 Dec 2011 00:21:46 GMT',
     'content-type': 'text/plain;charset=utf-8',
     'content-length': '66',
     'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.att_new_doc = function (callback) {
  nano.db.create(db_name("a"), function () {
    db("a").attachment.insert("new", "att", "Hello World!", "text/plain", callback);
  });
};

tests.att_new_doc_ok = function (e,b) {
  this.t.notOk(e);
  this.t.ok(b.ok);
  this.t.equal(b.id, "new");
};

ensure(__filename,tests,module,process.argv[2]);