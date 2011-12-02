var ensure = require('ensure')
  , nock   = require('nock') 
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_ch")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name("a"))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name("a"),
        date: 'Fri, 02 Dec 2011 00:34:57 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name("a") + '/foobar', {"foo":"bar"})
    .reply(201, "{\"ok\":true,\"id\":\"foobar\",\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name("a") +  '/foobar',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 00:34:58 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name("a") + '/barfoo', {"bar": "foo"})
    .reply(201, "{\"ok\":true,\"id\":\"barfoo\",\"rev\":\"1-41412c293dade3fe73279cba8b4cece4\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name("a") + '/barfoo',
        etag: '"1-41412c293dade3fe73279cba8b4cece4"',
        date: 'Fri, 02 Dec 2011 00:34:58 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name("a") + '/foobaz', {"foo":"baz"})
    .reply(201, "{\"ok\":true,\"id\":\"foobaz\",\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name("a") + '/foobaz',
        etag: '"1-cfa20dddac397da5bf0be2b50fb472fe"',
        date: 'Fri, 02 Dec 2011 00:34:58 GMT',
        'content-type': 'application/json',
        'content-length': '69',
        'cache-control': 'must-revalidate' })
    .get('/' + db_name("a") + '/_changes?since=2')
    .reply(200, "{\"results\":[\n{\"seq\":3,\"id\":\"foobaz\",\"changes\":[{\"rev\":\"1-cfa20dddac397da5bf0be2b50fb472fe\"}]}\n],\n\"last_seq\":3}\n\n", { 'transfer-encoding': 'chunked',
      server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
      etag: '"78IVA6O2WBXVUGGXYKZ7V2GBH"',
      date: 'Fri, 02 Dec 2011 00:34:58 GMT',
      'content-type': 'application/json',
      'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.changes_db = function (callback) {
  nano.db.create(db_name("a"), function () {
    async.parallel(
      [ function(cb) { db("a").insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db("a").insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db("a").insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db("a").changes({since:2}, callback);
      });
  });
};

tests.changes_db_ok = function (e,b) {
  this.t.notOk(e, 'No Error');
  this.t.equal(b.results.length,1, 'Gets one result');
  this.t.equal(b.last_seq,3, 'Last seq is 3');
  this.t.ok(couch.isDone(), 'Nock not done');
};

ensure(__filename,tests,module,process.argv[2]);