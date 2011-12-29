var _    = require('underscore')
  , tap  = require('tap')
  , test = tap.test
  , plan = tap.plan
  ;

module.exports = exports = function(name,tests,module,selected) {
  var f, ok, test_names, total = 0;
  if(selected) { test_names = selected.split(','); }
  else { test_names =
    _.filter(_.keys(tests), function(e) { return e.indexOf('_ok') === -1; });
  }
  test(name, function (t) {
    test_names.forEach(function(name) { // quick'n'dirty static analysis
      var f_body  = tests[name+'_ok'].toString()
        , count = f_body.match(/this\.t/gm).length
        ;
      total += count;
    });
    t.plan(total);
    test_names.forEach(function(name) {
      tests[name](function () { this.t = t; return tests[name+'_ok']; }());
    });
  });
};