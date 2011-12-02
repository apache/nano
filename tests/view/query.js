var ensure   = require('ensure')
  , nock     = require('nock')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("view_qu")
  , tests    = exports
  , couch
  ;

  couch = nock(cfg.url)
    .put('/' + db_name('2'))
    .reply(201, "{\"ok\":true}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('2'),
    date: 'Fri, 02 Dec 2011 03:19:26 GMT',
    'content-type': 'application/json',
    'content-length': '12',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('2') + '/randall', 
      { "name": "Randall"
      , "city": "San Francisco // CA, USA"
      })
    .reply(201, "{\"ok\":true,\"id\":\"randall\",\"rev\":\"1-37dfdbddd84354050154f2e39b6bda90\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('2') + '/randall',
    etag: '"1-37dfdbddd84354050154f2e39b6bda90"',
    date: 'Fri, 02 Dec 2011 03:19:26 GMT',
    'content-type': 'application/json',
    'content-length': '70',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('2') + '/nuno', 
      { "name": "Nuno"
      , "city": "Porto // PT, Portugal"
      })
    .reply(201, "{\"ok\":true,\"id\":\"nuno\",\"rev\":\"1-638d3cde87402899b4aacc6490c01d3b\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('2') + '/nuno',
    etag: '"1-638d3cde87402899b4aacc6490c01d3b"',
    date: 'Fri, 02 Dec 2011 03:19:26 GMT',
    'content-type': 'application/json',
    'content-length': '67',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('2') + '/derek', 
      { "name": "Derek"
      , "city": "San Francisco // CA, USA"})
    .reply(201, "{\"ok\":true,\"id\":\"derek\",\"rev\":\"1-f849b3014fcb990a74fca741edf34fea\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('2') + '/derek',
    etag: '"1-f849b3014fcb990a74fca741edf34fea"',
    date: 'Fri, 02 Dec 2011 03:19:26 GMT',
    'content-type': 'application/json',
    'content-length': '68',
    'cache-control': 'must-revalidate' })
    .put('/' + db_name('2') + '/_design/people', 
      {"views": {"by_name_and_city":
        {"map":"function(doc) { emit([doc.name, doc.city], doc._id); }"}}})
    .reply(201, "{\"ok\":true,\"id\":\"_design/people\",\"rev\":\"1-81370b2d35e19e28d491e81922bb9fba\"}\n", { server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    location: cfg.url + '/' + db_name('2') + '/_design/people',
    etag: '"1-81370b2d35e19e28d491e81922bb9fba"',
    date: 'Fri, 02 Dec 2011 03:19:27 GMT',
    'content-type': 'application/json',
    'content-length': '77',
    'cache-control': 'must-revalidate' })
    .get('/' + db_name('2') + '/_design/people/_view/by_name_and_city?key=%5B%22Derek%22%2C%22San%20Francisco%20%2F%2F%20CA%2C%20USA%22%5D')
    .reply(200, "{\"total_rows\":3,\"offset\":0,\"rows\":[\r\n{\"id\":\"derek\",\"key\":[\"Derek\",\"San Francisco // CA, USA\"],\"value\":\"derek\"}\r\n]}\n", { 'transfer-encoding': 'chunked',
    server: 'CouchDB/1.1.1 (Erlang OTP/R14B04)',
    etag: '"49G7ABUI3FOA4M2EHE2GG2OES"',
    date: 'Fri, 02 Dec 2011 03:19:27 GMT',
    'content-type': 'application/json',
    'cache-control': 'must-revalidate' });

function db_gen(i) { return nano.use(db_name(i)); }

function complex_key_test(cb,i,params,map) {
  map = map ? map : 'emit([doc.city,doc.name], doc._id);';
  nano.db.create(db_name(i), function () {
    var db = db_gen(i);
    async.parallel(
      [ function(cb2) { db.insert({name: "Derek", city: "San Francisco // CA, USA"}, "derek", cb2); }
      , function(cb2) { db.insert({name: "Randall", city: "San Francisco // CA, USA"}, "randall", cb2); }
      , function(cb2) { db.insert({name: "Nuno", city: "Porto // PT, Portugal"}, "nuno", cb2); }
      ],
      function(err, results){
        db.insert(
          { "views": 
            { "by_name_and_city": 
              { "map": "function(doc) { " + map + " }" } 
            }
          }, '_design/people'
          , function () {
            db.view('people','by_name_and_city', params, cb);
        });
      });
  });
}

tests.array_in_key = function (cb) {
  complex_key_test(cb,"2",{key: ["Derek","San Francisco // CA, USA"]},'emit([doc.name, doc.city], doc._id);');
};

tests.array_in_key_ok = function (e,b,h) {
  this.t.notOk(e);
  this.t.equal(b.rows.length,1);
  this.t.equal(b.rows.length,1);
  this.t.equal(b.rows[0].id,'derek');
  this.t.equal(b.rows[0].key[0],'Derek');
  this.t.equal(b.rows[0].key[1],'San Francisco // CA, USA');
};

ensure(__filename, tests, module, process.argv[2]);
