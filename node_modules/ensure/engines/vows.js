var _      = require('underscore')
  , vows   = require('vows')
  , assert = require('assert')
  , batch  = {}
  ;

module.exports = exports = function(name,tests,module,selected) {
  var f, ok, test_names;
  if(selected) { test_names = selected.split(','); }
  else { test_names =
    _.filter(_.keys(tests), function(e) { return e.indexOf('_ok') === -1; });
  }
  _.foldl(test_names, function(memo,e) {
    memo[e] = { topic: function () { tests[e](this.callback); }
              , ok: tests[e + '_ok']
              }; 
    return memo; }, batch);
  vows.describe('foo').addBatch(batch).exportTo(module);
};