var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_ge")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('b'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b'),
        date: 'Fri, 02 Dec 2011 19:28:49 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('a'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a'),
        date: 'Fri, 02 Dec 2011 19:28:49 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/foo', {"foo": "bar"})
    .reply(201, "{\"ok\": true,\"id\": \"foo\",\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a') + '/foo',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 19:28:49 GMT',
        'content-type': 'application/json',
        'content-length': '66',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('b') + '/foo', {"foo": "bar"})
    .reply(201, "{\"ok\": true,\"id\": \"foo\",\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('b') + '/foo',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 19:28:49 GMT',
        'content-type': 'application/json',
        'content-length': '66',
        'cache-control': 'must-revalidate' })
    .get('/' + db_name('a') + '/foo')
    .reply(200, "{\"_id\": \"foo\",\"_rev\": \"1-4c6114c65e295552ab1019e2b046b10e\",\"foo\": \"bar\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 19:28:50 GMT',
        'content-type': 'application/json',
        'content-length': '70',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('b') + '/foo', {"foo": "bar"})
    .reply(409, 
      "{\"error\": \"conflict\",\"reason\": \"Document update conflict.\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        date: 'Fri, 02 Dec 2011 19:28:50 GMT',
        'content-type': 'application/json',
        'content-length': '58',
        'cache-control': 'must-revalidate' })
    .get('/' + db_name('b') + '/foo?revs_info=true')
    .reply(200, "{\"_id\": \"foo\",\"_rev\": \"1-4c6114c65e295552ab1019e2b046b10e\",\"foo\": \"bar\",\"_revs_info\": [{\"rev\":\"1-4c6114c65e295552ab1019e2b046b10e\",\"status\": \"available\"}]}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        date: 'Fri, 02 Dec 2011 19:28:50 GMT',
        'content-type': 'application/json',
        'content-length': '151',
        'cache-control': 'must-revalidate' });

function db(i) { return nano.use(db_name(i)); }

tests.get_doc = function (callback) {
  nano.db.create(db_name('a'), function () {
    db('a').insert({foo: "bar"}, "foo", function () {
      db('a').get("foo", callback);
    });
  });
};

tests.get_doc_ok = function (e,b) {
  this.t.notOk(e, 'No excs');
  this.t.ok(b._rev, 'I got rev');
  this.t.equal(b._id, "foo", 'My id is foo');
  this.t.equal(b.foo, "bar", 'My foo is bar');
  this.t.ok(couch.isDone(), 'Nock is done');
};

tests.get_doc_params = function (callback) {
  nano.db.create(db_name('b'), function () {
    db('b').insert({foo: "bar"}, "foo", function () {
      db('b').insert({foo: "bar"}, "foo", function () { // Conflict, no rev
        db('b').get("foo", {revs_info: true}, callback);
      });
    });
  });
};

tests.get_doc_params_ok = function (e,b) {
  this.t.notOk(e, 'Err, not here');
  this.t.ok(b._revs_info, 'Got revs info');
  this.t.equal(b._id, "foo", 'Id is food');
  this.t.equal(b.foo, "bar", 'Bar is in foo');
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);