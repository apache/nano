var ensure = require('ensure')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg)
  , tests    = exports;

tests.delete_session = function (callback) {
  nano.use('_users').insert(
    { "_id"          : "org.couchdb.user:pat"
    , "type"         : "user"
    , "name"         : "pat"
    , "roles"        : ["tester"]
    , "password_sha" : "fdb2b8f8ae582440fbd11786fd9afd90920b42a1"
    , "salt"         : "659b9645544dfc82124b7fb07a0bd5f9"
    }, function(err,user) {
      nano.session.create('pat', '123', function(){
        nano.session.destroy(function(e,b,h){
          callback(e,user.rev,b,h);
        });
      });
    });
};

tests.delete_session_ok = function (err,rev,response,headers) {
  nano.use('_users').destroy('org.couchdb.user:pat',rev);
  this.t.notOk(err); 
  this.t.equal(headers['status-code'], 200); // header tests go here
  this.t.equal(headers['set-cookie'][0].length, 41);  
  this.t.equal(response.ok, true); // response tests go here  
};

ensure(__filename,tests,module,process.argv[2]);