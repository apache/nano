var ensure   = require('ensure')
  , async    = require('async')
  , cfg      = require('../../cfg/tests.js')
  , nano     = require('../../nano')(cfg)
  , db_name  = require('../utils').db_name("view_qu")
  , tests    = exports;

function db_gen(i) { return nano.use(db_name(i)); }

tests.recursive_create_view = function (tried,callback) {
  if(typeof tried === 'function') {
    callback = tried;
    tried = {tried:0, max_retries:2};
  }
  nano.db.create(db_name('1'), function () {
    var db = db_gen('1');
    db.view('cats','by_id', function (e,b,h) {
      if(tried.tried === tried.max_retries) { return callback('failed'); }
      if(e && e.message === 'missing') {
        return db.insert({"views": { "by_id": {
                    "map": "function(doc) { emit(doc._id, doc); }" } }
                  }, '_design/cats', function () {
          tried.tried += 1;
          tests.recursive_create_view(tried,callback);
        });
      }
      return callback(e,b,h);
    });
  });
};

tests.recursive_create_view_ok = function (e,view) {
  nano.db.destroy(db_name('1'));
  this.t.notOk(e);
  this.t.equal(view.total_rows,0);
};

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
  nano.db.destroy(db_name('2'));
  this.t.notOk(e);
  this.t.equal(b.rows.length,1);
  this.t.equal(b.rows.length,1);
  this.t.equal(b.rows[0].id,'derek');
  this.t.equal(b.rows[0].key[0],'Derek');
  this.t.equal(b.rows[0].key[1],'San Francisco // CA, USA');
};

ensure(__filename, tests, module, process.argv[2]);
