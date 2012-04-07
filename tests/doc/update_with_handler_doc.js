var ensure   = require('ensure')
  , nock     = require('nock')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("doc_up")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('a'))
    .reply(201, "{\"ok\":true}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a'),
        date: 'Fri, 02 Dec 2011 19:38:03 GMT',
        'content-type': 'application/json',
        'content-length': '12',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/foo', {"foo": "bar"})
    .reply(201, "{\"ok\": true,\"id\": \"foo\",\"rev\": \"1-4c6114c65e295552ab1019e2b046b10e\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a') + '/foo',
        etag: '"1-4c6114c65e295552ab1019e2b046b10e"',
        date: 'Fri, 02 Dec 2011 19:38:04 GMT',
        'content-type': 'application/json',
        'content-length': '66',
        'cache-control': 'must-revalidate' })
    .put('/' + db_name('a') + '/foo', 
      { "_rev": "1-4c6114c65e295552ab1019e2b046b10e"
      , "foo":  "baz"
      })
    .reply(201, "{\"ok\": true,\"id\": \"foo\",\"rev\": \"2-cfcd6781f13994bde69a1c3320bfdadb\"}\n", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a') + '/foo',
        etag: '"2-cfcd6781f13994bde69a1c3320bfdadb"',
        date: 'Fri, 02 Dec 2011 19:38:04 GMT',
        'content-type': 'application/json',
        'content-length': '66',
        'cache-control': 'must-revalidate' })
	.put('/' + db_name('a') + '/_design/my_design_doc/_update/in-place/foo {"field":"bar","value":"foo"}')
    .reply(201, "[{\"id\": \"foo\", \"key\": \"foo\", \"value\": { \"foo\": \"baz\", \"bar\": \"foo\"} }, \"set bar to foo\"]", 
      { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
        location: cfg.url + '/' + db_name('a') + '/foo',
        etag: '"2-cfcd6781f13994bde69a1c3320bfdadb"',
        date: 'Fri, 02 Dec 2011 19:38:04 GMT',
        'content-type': 'application/json',
        'content-length': '66',
        'cache-control': 'must-revalidate' }
    );

function db(i) { return nano.use(db_name(i)); }

tests.update_with_handler_doc = function (callback) {
  nano.db.create(db_name('a'), function () {
    db('a').insert({foo: "bar"}, "foo", function (_,b) {
      db('a').insert({"_rev": b.rev, foo: "baz"}, "foo", function(_,b) {
        db('a').updateWithHandler('my_design_doc','in-place', 'foo', {field: 'bar', value: 'foo'}, callback);        
      });
    });
  });
};


tests.update_with_handler_doc_ok = function (e,b) {
  this.t.notOk(e, 'I got err free status');
  this.t.equal(b[0].id, "foo", 'My filename is foo');
  this.t.ok(b[0].key, 'I am now ok');
  this.t.ok(b[0].value, 'I got value');
  
  this.t.ok(couch.isDone(), 'Nock is done');
};

ensure(__filename,tests,module,process.argv[2]);