'use strict';

var debug = require('debug')('nano/logger');

module.exports = function logging(cfg) {
  var log = cfg && cfg.log;
  var logStrategy = typeof log === 'function' ? log : debug;

  return function logEvent(prefix) {
    var eventId = (prefix ? prefix + '-' : '') +
      (~~(Math.random() * 1e9)).toString(36);
    return function log() {
      logStrategy.call(this, eventId, [].slice.call(arguments, 0));
    };
  };
};
