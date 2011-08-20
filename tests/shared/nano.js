var vows     = require('vows')
  , assert   = require('assert')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano');

/*****************************************************************************
 * version                                                                   *
 *****************************************************************************/
function version(callback) { callback(null,nano.version); }
function version_ok(_,n) { assert.ok(n); }

/*****************************************************************************
 * path                                                                      *
 *****************************************************************************/
function path(callback) { callback(null,nano.path); }
function path_ok(_,n) { assert.ok(n); }

vows.describe('nano').addBatch({
  "version": {
    topic: function () { version(this.callback); }
  , "=": version_ok },
  "path": {
    topic: function () { path(this.callback); }
  , "=": path_ok }
}).exportTo(module);