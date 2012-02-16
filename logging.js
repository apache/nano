// Simple event+strategy-based logging for NanoCouch
// written by: Derek Perez
var verbose = (process.env.NANO_ENV==='testing');

// snippet by Marak Squires.
function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var str = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        str += charSet.substring(randomPoz,randomPoz+1);
    }
    return str;
}

module.exports = function logging(cfg) {
  var logStrategy = cfg ? cfg.log : undefined;
  this.cfg = cfg;
  if (typeof logStrategy !== 'function') {
    if(verbose) {
      logStrategy = function consoleLog(eventId, args) { 
        console.log(eventId, args);
      }; 
    }
    else logStrategy = function noop(){};
  }

  return function logEvent(prefix) {
    var eventId = (prefix ? prefix + '-' : '') + randomString(10);
    return function log() {
      logStrategy.call(this, eventId,
        [].slice.call(arguments,0)); // convert arguments into array
    };
  };
};