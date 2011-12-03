var ensure   = require('ensure')
  , nock     = require('nock')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_bu")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('a'))
    .reply(201, "{\"ok\":true}\n"
      , { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
          location: cfg.url + '/' + db_name('a'),
          date: 'Fri, 02 Dec 2011 19:18:16 GMT',
          'content-type': 'application/json',
          'content-length': '12',
          'cache-control': 'must-revalidate' })
    .post('/' + db_name('a') + '/_bulk_docs'
    , { "docs": 
        [ {"key": "baz","name": "bazzel"}
        , {"key": "bar", "name": "barry"}
        ]
      })
    .reply(201, "[{\"id\":\"b31761fe89e0d343c41d3cdbd9004eb7\",\"rev\":\"1-f5f3f3e496c72307975a69c73fd53d42\"},{\"id\":\"b31761fe89e0d343c41d3cdbd9005632\",\"rev\":\"1-8ad0e70d5e6edd474ec190eac2376bde\"}]\n", 
    { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
      date: 'Fri, 02 Dec 2011 19:18:17 GMT',
      'content-type': 'application/json',
      'content-length': '172',
      'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.bulk_docs = function (callback) {
  nano.db.create(db_name("a"), function () {
    db("a").bulk(
      {"docs":[{"key":"baz","name":"bazzel"},{"key":"bar","name":"barry"}]},
      function (e,r) {
        callback(e,r);
      });
  });
};

tests.bulk_docs_ok = function (e,b) {
  this.t.notOk(e, 'No error');
  this.t.equal(b.length, 2, 'Two docs');
  this.t.ok(b[0].id, 'First got id');
  this.t.ok(b[1].id, 'Second got id');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);