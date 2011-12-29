var ensure = require('../../ensure')
  , tests = exports
  ;

tests.tap    = function (cb) { cb('foo'); };
tests.tap_ok = function (value)  {
  this.t.equal(value,'foo','foo works'); 
};

tests.tap2    = function (cb) { cb('foo','bar'); };
tests.tap2_ok = function (foo,bar)  {
  this.t.equal(foo,'foo','foo is foo');
  this.t.equal(bar,'bar','bar is bar');
};

tests.plan_works    = function (cb) { cb('bar'); };
tests.plan_works_ok = function (value)  {
  this.t.equal(value,'bar','plan tests work');
};

ensure('tap',tests,module,process.argv[2]);