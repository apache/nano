# Nano

`nano` (short for NanoCouch) is a minimalistic CouchDB driver for Node.js.

## Instalation

1. Install [npm][1]
2. `npm install nano`

## Usage

A quick example on using `nano`.

In `nano` callback always return three arguments:

      err: The error, if any. Check error.js for more info.
      headers: The HTTP response headers from CouchDB, if no error.
      response: The HTTP response body from CouchDB, if no error.

Because in `nano` you can do database operations you are not bound to one and only one database. The first thing you do is load the module pointing either providing a JSON configuration object or a string that represents the relative file path of that config, e.g. `cfg/tests.js`. Do refer to [cfg/couch.example.js][4] for a sample.

      var nano = require('nano')('./cfg/tests.js');

Now you can do your database operations using `nano`. These include things like create, delete or list databases. Let's create a database to store some documents:

      nano.db.create("alice");

Where is my callback? Well in `nano` you have the option of not having a callback and say "I don't care".

Of course now you want to insert some documents and you wish you had the callback, so let's add it:

      // Clean up the database we created previously
      nano.db.destroy("alice", function(err,headers,response) {
        nano.db.create("alice", function(){
          // Specify the database we are going to use
          var alicedb = nano.use("alice");
          alicedb.insert("rabbit", {crazy: true}, function(e,h,r){
            if(e) { throw e; }
            console.log("You have inserted the rabbit.")
          });
        });
      });

The `alicedb.use` method creates a `scope` where you operate inside a single database. This is just a convenience so you don't have to specify the database name every single time you do an update or delete.

Don't forget to delete the database you created:

      nano.db.destroy("alice");

## Interfaces

### Documents

Assuming `var db = nano.use("somedb");`:

      db.insert(doc_name,doc,callback) // doc_name is optional
      db.update(doc_name,rev,doc,callback)
      db.destroy(doc_name,rev,callback)
      db.get(doc_name,callback)
      db.list(callback)

### Databases

      nano.db.create(db_name,callback)
      nano.db.destroy(db_name,callback)
      nano.db.get(db_name,callback)
      nano.db.list(callback) 
      nano.db.compact(db_name,callback)
      nano.db.replicate(source,target,continuous,callback) // continuous is optional

### Other / Advanced

      nano.use(db_name)
      nano.request(opts,callback)

### Aliases

You can use `nano.scope` instead of `nano.use`. They are both also available inside db, e.g. `nano.db.scope`.

When using a database with `nano.use` you can still `replicate`, `compact`, and `list` the database you are using. e.g. to list you can use `db.info` (because `db.list` is for listing documents). Other methods remain the same, e.g. `db.replicate`.

## Future plans

Some future plans are mostly:

1. Add `proxy`, `pipe`, and `ssl` support as provided by request
2. Explore adding `_changes` feed
3. Convenience functions for attachments
4. Support views
5. Support bulk load
6. `_uuids`, `_stats`, `_config`, `_active_tasks`, `_all_docs_by_seq`
7. Support `batch` in updates and inserts.

Great segway to contribute.

## Contribute

Everyone is welcome to contribute. 

1. Fork `nano` in github
2. Create a new branch - `git checkout -b my_branch`
3. Create tests for the changes you made
4. Make sure you pass both existing and newly inserted tests
5. Commit your changes
6. Push to your branch - `git push origin my_branch`
7. Create an pull request

### Running the tests

To run the tests simply browse to `test/` and `./run`. Don't forget to install the packages referred as dev dependencies in `package.json`.

Always make sure all the tests pass before sending in your pull request!
OR I'll tell Santa!

## Meta

                    _
                  / _) ROAR! I'm a vegan!
           .-^^^-/ /
        __/       /
       /__.|_|-|_|

* Code: `git clone git://github.com/dscape/nano.git`
* Home: <http://github.com/dscape/nano>
* Bugs: <http://github.com/dscape/nano/issues>

`(oO)--',-` in [caos][3]

[1]: http://npmjs.org
[2]: http://github.com/dscape/nano/issues
[3]: http://caos.di.uminho.pt/
[4]: https://github.com/dscape/nano/blob/master/cfg/couch.example.js