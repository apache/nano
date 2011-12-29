# ensure

`ensure` is just a simple way to test in node.js

# installation

1. install [npm][1]
2. `npm install ensure`

# usage

```js
  var ensure = require('ensure')
    , tests = exports
    ;

  tests.foo = function (callback) {
    callback(true);
  };

  tests.foo_ok = function (t) {
    this.t.ok(t);
  };

  ensure('foo', tests, module);
```
run it:

```sh
  node foo.js
```

an extra parameter is available to allow you to define only some tests from a specific file. you can do this by providing a comma separated list of tests you want to run, e.g. `ensure('foo',tests,module,'foo,bar');`. you can use this in combination with `process.argv` to choose what tests to run from the shell:

```js
  // assuming node foo.js foo,bar
  ensure('foo',tests,module,process.argv[2]);
```

you can also set `ensure` to use a different test engine. for now we have [tap][4] and [vows][5] available with `tap` by default. here's an example using vows

```js
  var ensure = require('ensure')
    , assert = require('assert')
    , tests  = exports
    ;

  tests.vows    = function (cb) { cb('foo'); };
  tests.vows_ok = function (value)  {
    assert.equal(value,'foo','foo test worked'); 
  };

  ensure(__filename,tests,module,process.argv[2]);
```

to run test `vows` you can do:

```sh
  node vows.js vows
```

`vows` is the test name and _is_ optional (by default all tests run).

*note:* `this.t` should not be placed in a variable. `ensure` uses a very simple static analysis algorithm to determine how many assertions exist in your callback. if you think this is not satisfactory feel free to make a pull request with better static analysis code.

# contribute

everyone is welcome to contribute. patches, bug-fixes, new features

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

# meta

* code: `git clone git://github.com/dscape/ensure.git`
* home: <http://github.com/dscape/ensure>
* bugs: <http://github.com/dscape/ensure/issues>

`(oO)--',-` in [caos][3]

[1]: http://npmjs.org
[2]: http://github.com/dscape/ensure/issues
[3]: http://caos.di.uminho.pt/
[4]: https://github.com/isaacs/node-tap
[5]: http://vowsjs.org/
