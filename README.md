# nano

Minimalistic CouchDB driver for Node.js

`nano` features:

* **Minimalistic** - there is only a minimun of abstraction between you and 
  CouchDB
* **Pipes** - proxy requests from CouchDB directly to your end user
* **Errors** - errors are proxied directly from CouchDB: if you know ChouchDB 
  you already know `nano`


## Installation

1. install [npm][1]
2. `npm install nano`

## Getting started

To use `nano` you need to connect it to your CouchDB install, to do that:

``` js
var nano = require('nano')('http://localhost:5984');
```

To create a new database:

``` js
nano.db.create('alice');
```

And to use it:

``` js
var alice = nano.db.use('alice');
```

In this examples we didn't specify a function `callback`, usually you don't
want that.
In `nano` the callback function has always three arguments:

* `err` - the error, if any
* `body` - the http _response body_ from couchdb, if no error. 
  JSON parsed body, binary for non JSON responses
* `header` - the http _response header_ from CouchDB, if no error


A simple but complete example using callbacks is:

``` js
var nano = require('nano')('http://localhost:5984');

// clean up the database we created previously
nano.db.destroy('alice', function() {
  // create a new database
  nano.db.create('alice', function() {
    // specify the database we are going to use
    var alice = nano.use('alice');
    // and insert a document in it
    alice.insert({ crazy: true }, 'rabbit', function(err, body, header) {
      if (err) {
        console.log('[alice.insert] ', err.message);
        return;
      }
      console.log('You have inserted the rabbit.')
      console.log(body);
    });
  });
});
```

If you run this example(after starting CouchDB) you will see:

    You have inserted the rabbit.
    { ok: true,
      id: 'rabbit',
      rev: '1-6e4cb465d49c0368ac3946506d26335d' }

You can also see your document in [Futon](http://localhost:5984/_utils)

## Databases functions

### nano.db.create(name, [callback])

Asynchronously creates a CouchDB database with the given `name`.

``` js
nano.db.create('alice', function(err, body) {
  if (!err) {
    console.log('Database alice created!');
  }
});
```

### nano.db.get(name, [callback])

Asynchronously get informations about `name`.

``` js
nano.db.get('alice', function(err, body) {
  if (!err) {
    console.log(body);
  }
});
```

### nano.db.destroy(name, [callback])

Asynchronously destroys `name`.

``` js
nano.db.destroy('alice');
```

Even though this examples looks sync it is an async function.

### nano.db.list([callback])

Asynchronously lists all the databases in CouchDB

``` js
nano.db.list(function(err, body) {
  // body is an Array
  body.forEach(function(db) {
    console.log(db);
  });
});
```

### nano.db.compact(name, [designName], [callback])

Asynchronously compacts `name`, if `designName` is specified also compacts its
views.

### nano.db.replicate(source, target, [opts], [callback])

Asynchronously replicates `source` on `target` with options `opts`. `target`
has to exist, add `create_target:true` to `opts` to create it prior to
replication.

``` js
nano.db.replicate('alice', 'http://admin:password@otherhost.com:5984/alice',
                  { create_target:true }, function(err, body) {
    if (!err) 
      console.log(body);
});
```

### nano.db.changes(name, [params], [callback])

Asynchonously asks for the changes feed of `name`, `params` contains additions
to the querystring.

``` js
nano.db.changes('alice', function(err, body) {
  if (!err)
    console.log(body);
});
```

### nano.use(name)

Creates a scope where you operate inside `name`.

``` js
var alice = nano.use('alice');
alice.insert({ crazy: true }, 'rabbit', function(err, body) {
  // do something
});
```

### nano.db.use(name)

Alias for `nano.use`

### nano.db.scope(name)

Alias for `nano.use`

### nano.scope(name)

Alias for `nano.use`

### nano.request(opts, [callback])

Asynchronously makes a request to CouchDB, the available `opts` are:

* `opts.db` - the database name
* `opts.method` - the http method, defaults to `GET`
* `opts.path` - the full path of the request, overrides `opts.doc` and
  `opts.att`
* `opts.doc` - the document name
* `opts.att` - the attachment name
* `opts.content_type` - the content type of the request, default to `json`
* `opts.body` - the document or attachment body
* `opts.encoding` - the encoding for attachments

### nano.relax(opts, [callback])

Alias for `nano.request`

### nano.dinosaur(opts, [callback])

Alias for `nano.request`

                / _) ROAR! i'm a vegan!
         .-^^^-/ /
      __/       /
     /__.|_|-|_|
 
### nano.config

An object containing the nano configurations, possible keys are:

* `url` - the CouchDB url
* `db` - the database name

## Documents functions

### db.insert(doc, [docName], [callback])

Inserts `doc` in the database with an optional `docName`.  
This function is asynchronous.

``` js
var alice = nano.use('alice');
alice.insert({ crazy: true }, 'rabbit', function(err, body) {
  if (!err)
    console.log(body);
});
```

### db.destroy(docName, rev, [callback])

Asynchronously removes revision `rev` of `docName` from CouchDB.

``` js
alice.destroy('alice', '3-66c01cdf99e84c83a9b3fe65b88db8c0', function(err, body) {
  if (!err)
    console.log(body);
});
```

### db.get(docName, [params], [callback])

Asynchronously gets `docName` from the database with optional querystring
additions `params`.

``` js
alice.get('rabbit', { revs_info: true }, function(err, body) {
  if (!err)
    console.log(body);
});
```

### db.bulk(docs, [params], [callback])

Bulk operations(update/delete/insert) on the database, refer to the 
[CouchDB doc](http://wiki.apache.org/couchdb/HTTP_Bulk_Document_API).

### db.list([params], [callback])

List all the docs in the database with optional querystring additions `params`.  
This function is asynchronous.

``` js
alice.list(function(err, body) {
  if (!err) {
    body.rows.forEach(function(doc) {
      console.log(doc);
    });
  }
});
```

### db.fetch(docNames, [params], [callback])

Bulk fetch of the database documents, `docNames` are specified as per 
[CouchDB doc](http://wiki.apache.org/couchdb/HTTP_Bulk_Document_API).
Additionals querystring `params` can be specified, `include_doc` is always set
to `true`.  
This function is asynchronous.

## Attachments functions

### db.attachment.insert(docName, attName, att, contentType, [params], [callback])

Asynchronously inserts an attachment `attName` to `docName`, in most cases
 `params.rev` is required. Refer to the
 [doc](http://wiki.apache.org/couchdb/HTTP_Document_API) for more details.

``` js
var fs = require('fs');

fs.readFile('rabbit.png', function(err, data) {
  if (!err) {
    alice.attachment.insert('rabbit', 'rabbit.png', data, 'image/png',
      { rev: '12-150985a725ec88be471921a54ce91452' }, function(err, body) {
        if (!err)
          console.log(body);
    });
  }
});
```

Or using `pipe`:

``` js
var fs = require('fs');

fs.createReadStream('rabbit.png').pipe(
    alice.attachment.insert('new', 'rab.png', {}, 'image/png')
);
```

### db.attachment.get(docName, attName, [params], [callback])

Get `docName`'s attachment `attName` with optional querystring additions
`params`.  
This function is asynchronous.

``` js
var fs = require('fs');

alice.attachment.get('rabbit', 'rabbit.png', function(err, body) {
  if (!err) {
    fs.writeFile('rabbit.png', body);
  }
});
```

Or using `pipe`:

``` js
var fs = require('fs');

alice.attachment.get('rabbit', 'rabbit.png').pipe(fs.createWriteStream('rabbit.png'));
```

### db.attachment.destroy(docName, attName, rev, [callback])

Asynchronously destroy attachment `attName` of `docName`'s revision `rev`.

``` js
alice.attachment.destroy('rabbit', 'rabbit.png',
    '1-4701d73a08ce5c2f2983bf7c9ffd3320', function(err, body) {
      if (!err)
        console.log(body);
});
```

## Views and design functions

### db.view(designName, viewName, [params], [callback])

Calls a view of the specified design with optional querystring additions
`params`.  
This function is asynchronous.

``` js
alice.view('characters', 'crazy_ones', function(err, body) {
  if (!err) {
    body.rows.forEach(function(doc) {
      console.log(doc.value);
    });
  }
});
```

### db.updateWithHandler(designName, updateName, docName, [body], [callback])

Calls the design's update function with the specified doc in input.

## Advanced features

### Extending nano

Nano is minimalistic but you can add your own features with
`nano.request(opts, callback)`

For example, to create a function to retrieve a specific revision of the
`rabbit` document:

``` js
function getRabbitRev(rev, callback) {
  nano.request({ db: 'alice',
                 doc: 'rabbit',
                 method: 'GET',
                 params: { rev: rev }
               }, callback);
}

getRabbitRev('4-2e6cdc4c7e26b745c2881a24e0eeece2', function(err, body) {
  if (!err) {
    console.log(body);
  }
});
```
### Pipes

You can pipe in nano like in any other stream.  
For example if our `rabbit` document has an attachment with name `picture.png`
(with a picture of our white rabbit, of course!) you can pipe it to a `Writable
Stream`

``` js
var fs = require('fs'),
    nano = require('nano');
var alice = nano.use('alice');
alice.attachment.get('rabbit', 'picture.png').pipe(fs.createWriteStream("/tmp/rabbit.png"));
```

Then open `/tmp/rabbit.png` and you will see the rabbit picture.


## Tutorials & screencasts

* screencast: [couchdb and nano](http://nodetuts.com/tutorials/30-couchdb-and-nano.html#video)
* article: [nano - a minimalistic couchdb client for nodejs](http://writings.nunojob.com/2011/08/nano-minimalistic-couchdb-client-for-nodejs.html)
* article: [getting started with node.js and couchdb](http://writings.nunojob.com/2011/09/getting-started-with-nodejs-and-couchdb.html)
* article: [Document Update Handler Support](http://jackhq.tumblr.com/post/16035106690/nano-v1-2-x-document-update-handler-support-v1-2-x)

## Roadmap

Check [issues][2]

## Tests

To run (and configure) the test suite simply:

``` sh
cd nano
vi cfg/tests.js
npm install # should install ensure and async, if it doesn't install manually
npm test
```

after adding a new test you can run it individually (with verbose output) using:

``` sh
NANO_ENV=testing node tests/doc/list.js list_doc_params
```

where `list_doc_params` is the test name.

## Contribute

Everyone is welcome to contribute with patches, bugfixes and new features

1. create an [issue][2] on github so the community can comment on your idea
2. fork `nano` in github
3. create a new branch `git checkout -b my_branch`
4. create tests for the changes you made
5. make sure you pass both existing and newly inserted tests
6. commit your changes
7. push to your branch `git push origin my_branch`
8. create a pull request


## Meta

                    _
                  / _) ROAR! i'm a vegan!
           .-^^^-/ /
        __/       /
       /__.|_|-|_|     cannes est superb

* code: `git clone git://github.com/dscape/nano.git`
* home: <http://github.com/dscape/nano>
* bugs: <http://github.com/dscape/nano/issues>
* build: [![build status](https://secure.travis-ci.org/dscape/nano.png)](http://travis-ci.org/dscape/nano)

`(oO)--',-` in [caos][3]

[1]: http://npmjs.org
[2]: http://github.com/dscape/nano/issues
[3]: http://caos.di.uminho.pt/
[4]: https://github.com/dscape/nano/blob/master/cfg/couch.example.js

## License

Copyright 2011 nuno job <nunojob.com> (oO)--',--

Licensed under the apache license, version 2.0 (the "license");
you may not use this file except in compliance with the license.
You may obtain a copy of the license at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the license is distributed on an "as is" basis,
without warranties or conditions of any kind, either express or implied.
See the license for the specific language governing permissions and
limitations under the license.
