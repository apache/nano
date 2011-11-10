# nano

`nano` (short for `nanocouch`) is a minimalistic `couchdb` driver for `node.js`

# installation

1. install [npm][1]
2. `npm install nano`

# usage

``` js
  var nano = require('nano')('http://localhost:5984');
```

within the `nano` variable you have various methods you can call. these include tasks like create, delete or list databases:

``` js
  nano.db.create("alice");
```

in this function there is not callback. in `nano` the absence of callback means "do this, ignore what happens"

you normally don't want to do that though:

``` js
  // clean up the database we created previously
  nano.db.destroy("alice", function(err,response,headers) {
    nano.db.create("alice", function() {
      // specify the database we are going to use
      var alice = nano.use("alice");
      alice.insert({crazy: true}, "rabbit", function(e,r,h){
        if(e) { throw e; }
        console.log("you have inserted the rabbit.")
      });
    });
  });
```

the `nano.use` method creates a `scope` where you operate inside a single database. this is just a convenience so you don't have to specify the database name every single time you do an update or delete

``` js
  // 5: var alice = nano.use("alice");
```

in `nano` a callback has always three arguments

``` js
  // 6: alice.insert({crazy: true}, "rabbit", function(e,r,h) {
  // 7:   if(e) { throw e; }
  // 8:   console.log("you have inserted the rabbit.")
  // 9: });
```

meaning:

      e: the `error`, if any. check error.js for more info.
      r: the http `response body` from couchdb, if no error.
      h: the http response `headers` from couchdb, if no error.

errors include responses from couchdb which had a non-200 response code. that's it. don't forget to delete the database you created:

``` js
  nano.db.destroy("alice");
```

# tutorials

* [nano - a minimalistic couchdb client for nodejs](http://writings.nunojob.com/2011/08/nano-minimalistic-couchdb-client-for-nodejs.html)
* [getting started with node.js and couchdb](http://writings.nunojob.com/2011/09/getting-started-with-nodejs-and-couchdb.html)

# interfaces

`*` marks optional
`params` are additional querystring parameters

## databases, et al

### functions

`server.db.create(db_name,callback*)`
`server.db.get(db_name,callback*)`
`server.db.destroy(db_name,callback*)`
`server.db.list(callback*)`
`server.db.compact(db_name,design_name*,callback*)`
`server.db.replicate(source,target,continuous*,callback*)`
`server.db.changes(db_name,params*,callback*)`
`server.use(db_name)`
`server.request(opts,callback*)`
`server.config`

### aliases

`nano.use: [nano.db.use, nano.db.scope, nano.scope]`
`nano.request: [nano.relax, nano.dinosaur]`

## documents, attachments, views, et al

### functions

`db.insert(doc,doc_name*,callback*)`
`db.destroy(doc_name,rev,callback*)`
`db.get(doc_name,params*,callback*)`
`db.bulk(docs,callback*)`
`db.list(params*,callback*)`
`db.view(design_name,view_name,params*,callback*)`
`db.attachment.insert(doc_name,att_name,att,content_type,params*,callback*)`
`db.attachment.get(doc_name,att_name,params*,callback*)`
`db.attachment.destroy(doc_name,att_name,rev,callback*)`

### aliases

`nano.use` sets `db_name` in scope so you don't have to specify it every time

`nano.db.get: [doc.info(callback*)]`
`nano.db.replicate: [doc.replicate(target,continuous*,callback*)]`
`nano.db.compact:  [doc.compact(callback*), doc.view.compact(design_name,callback*)]`
`nano.db.changes: [doc.changes(params*,callback*)]`

## advanced

`nano` is minimalistic so it provides advanced users with a way to code their own extension functions:

``` js
  nano.request(opts,callback*)
```

to get a document in a specific rev an advanced user might do:

``` js
  nano.request( { db: "alice"
                , doc: "rabbit"
                , method: "GET"
                , params: { rev: "1-967a00dff5e02add41819138abb3284d"}
                },
    function (_,b) { console.log(b) });
```

this is the same as (assuming `alice = require('nano')('http://localhost:5984/alice')`):

``` js
  alice.get("rabbit", {rev: "1-967a00dff5e02add41819138abb3284d"},
    function (_,b) { console.log(b) });
```

### pipe

you can pipe in `nano` just like you do in any other stream. this is available in all methods:

``` js
  alice.attachment.get("breakfast", "sugar", {rev: rev})
    .pipe(fs.createWriteStream("/tmp/sugar-for-rabbit"));
```

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

to run (and configure) the test suite simply:

``` sh
  cd nano
  vi cfg/tests.js
  npm install # should install ensure and async, if it doesnt install manually
  npm test
```

after adding a new test you can run it individually (with verbose output) using:

``` sh
  NANO_ENV=testing node tests/doc/list.js list_doc_params
```

where `list_doc_params` is the test name.

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
