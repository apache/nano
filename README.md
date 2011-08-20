# nano

`nano` (short for `nanocouch`) is a minimalistic `couchdb` driver for `node.js`

# instalation

1. install [npm][1]
2. `npm install nano`

# usage

a quick example using `nano`

to use `nano` you have to either provide a) a `json` `configuration object` or b) a `configuration file path` like `cfg/tests.js`. refer to [cfg/couch.example.js][4] for a example

      var nano = require('nano')('http://localhost:5984');

within the `nano` variable you have various methods you can call. these include tasks like create, delete or list databases:

      nano.db.create("alice");

in this function there is not callback. in `nano` the absence of callback means "do this, ignore what happens"

you normally don't want to do that though:

      // clean up the database we created previously
      nano.db.destroy("alice", function(err,headers,response) {
        nano.db.create("alice", function(){
          // specify the database we are going to use
          var alice = nano.use("alice");
          alice.insert({crazy: true}, "rabbit", function(e,h,r){
            if(e) { throw e; }
            console.log("you have inserted the rabbit.")
          });
        });
      });

the `nano.use` method creates a `scope` where you operate inside a single database. this is just a convenience so you don't have to specify the database name every single time you do an update or delete

      // 5: var alice = nano.use("alice");

in `nano` a callback has always three arguments

      // 6: alice.insert({crazy: true}, "rabbit", function(e,h,r){
      // 7:   if(e) { throw e; }
      // 8:   console.log("you have inserted the rabbit.")
      // 9: });

meaning:

      e: the `error`, if any. check error.js for more info.
      h: the http response `headers` from couchdb, if no error.
      r: the http `response body` from couchdb, if no error.

that's it. don't forget to delete the database you created:

      nano.db.destroy("alice");

# tutorial

for a small tutorial check out [writings.nunojob.com/2011/08/nano-minimalistic-couchdb-client-for-nodejs.html](http://writings.nunojob.com/2011/08/nano-minimalistic-couchdb-client-for-nodejs.html)

# interfaces

`*` marks optional
`params` are additional querystring parameters

## databases, et al

### functions

`nano.db.create(db_name,callback*)`
`nano.db.get(db_name,callback*)`
`nano.db.destroy(db_name,callback*)`
`nano.db.list(callback*)`
`nano.db.compact(db_name,design_name*,callback*)`
`nano.db.replicate(source,target,continuous*,callback*)`
`nano.db.changes(db_name,params*,callback*)`
`nano.use(db_name)`
`nano.request(opts,callback*)`
`nano.config`

### aliases

`nano.use: [nano.db.use, nano.db.scope, nano.scope]`
`nano.request: [nano.relax, nano.dinosaur]`

## documents, attachments, et al

### functions

`doc.insert(doc,doc_name*,callback*)`
`doc.destroy(doc_name,rev,callback*)`
`doc.get(doc_name,params*,callback*)`
`doc.bulk(docs,callback*)`
`doc.list(params*,callback*)`
`doc.attachment.insert(doc_name,att_name,att,content_type,params*,callback*)`
`doc.attachment.get(doc_name,att_name,params*,callback*)`
`doc.attachment.destroy(doc_name,att_name,rev,callback*)`

### aliases

`nano.use` sets `db_name` in scope so you don't have to specify it every time

`nano.db.get: [doc.info(callback*)]`
`nano.db.replicate: [doc.replicate(target,continuous*,callback*)]`
`nano.db.compact:  [doc.compact(callback*), doc.view.compact(design_name,callback*)]`
`nano.db.changes: [doc.changes(params*,callback*)]`

## advanced

`nano` is minimalistic so it provides advanced users with a way to code their own extension functions:
      
      nano.request(opts,callback*)

to get a document in a specific rev an advanced user might do:

      nano.request( { db: "alice"
                    , doc: "rabbit"
                    , method: "GET"
                    , params: { rev: "1-967a00dff5e02add41819138abb3284d"} 
                    },
        function (_,_,b) { console.log(b) }
      );

this is the same as (assuming `alice = nano.use("alice");`):

      alice.get("rabbit", {rev: "1-967a00dff5e02add41819138abb3284d"},
        function (_,_,b) { console.log(b) }
      );

### pipe

you can pipe in `nano` just like you do in any other stream. this is available in all methods:

      alice.attachment.get("breakfast", "sugar", {rev: rev})
        .pipe(fs.createWriteStream("/tmp/sugar-for-rabbit"));

# roadmap

check [issues][2]

# contribute

everyone is welcome to contribute. patches, bugfixes, new features

1. create an [issue][2] on github so the community can comment on your idea
2. fork `nano` in github
3. create a new branch `git checkout -b my_branch`
4. create tests for the changes you made
5. make sure you pass both existing and newly inserted tests
6. commit your changes
7. push to your branch `git push origin my_branch`
8. create an pull request

# tests

1. install the packages referred as dev dependencies in `package.json`
2. browse to `test/` and `./run`.

always make sure all the tests pass before sending in your pull request!

we will tell santa

# meta

                    _
                  / _) ROAR! i'm a vegan!
           .-^^^-/ /
        __/       /
       /__.|_|-|_|     cannes est superb

* code: `git clone git://github.com/dscape/nano.git`
* home: <http://github.com/dscape/nano>
* bugs: <http://github.com/dscape/nano/issues>

`(oO)--',-` in [caos][3]

[1]: http://npmjs.org
[2]: http://github.com/dscape/nano/issues
[3]: http://caos.di.uminho.pt/
[4]: https://github.com/dscape/nano/blob/master/cfg/couch.example.js