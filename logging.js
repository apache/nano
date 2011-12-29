// Simple event+strategy-based logging for NanoCouch
// written by: Derek Perez

var verbose = (process.env.NANO_ENV==='testing');
var _       = require('underscore');

// snippet by Marak Squires.
// Generates a pesuedo-random identifier for a log event.
function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

// logging generator, expects a strategy function
// to be provided on require of the module.
// a logging strategy should support two arguments,
// the first an `eventId` used to identify a group of
// log events that would be considered related. the second
// is an array of values that nano may pass to the logStrategy.
module.exports = function(logStrategy) {

  // if we've been provided no strategy
  // for our logs, and verbose mode is active,
  // simply pipe to console.log.
  if (!logStrategy && verbose)
    logStrategy = function(eventId, args) { console.log(eventId, args) }

  // by default, if we have no logging
  // strategy provided, we'll simply return
  // an empty function, no output.
  else if (!logStrategy)
    logStrategy = function(){}

  // the export returns the `logEvent` root function.
  // calling this function returns a curried `log` function
  // which will allow the user to associate all log hits with
  // a unique log eventId. Providing a prefix is optional, simply
  // prepends a string to the random string generator, for extra
  // debugging goodness.
  return function logEvent(prefix) {
    var eventId = (prefix ? prefix+'-' : '') + randomString(10);
    return function log() {
      logStrategy.call(this, eventId, _.toArray(arguments));
    }
  }

}