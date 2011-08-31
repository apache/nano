/* Config file used during tests
 * Don't remove or modify
 *
 * - Or else...
 * - Or else what?
 * - Or else nothin'
 */
var cfg = { host: 'nodejsbug.iriscouch.com'
          , port: '5984'
          , ssl:  false // Not yet
          };

/* NOT REQUIRED */
cfg.http_credentials = function credentials() {
  if (cfg.user && cfg.pass) {
    return cfg.user + ":" + cfg.pass + "@";
  }
  else { return ""; }
}();

cfg.url_noauth = function (){
  return "http" + (cfg.ssl ? "s" : "") + "://" + cfg.host + ":" + cfg.port;
}();

/* REQUIRED */
cfg.url = function (){
  return "http" + (cfg.ssl ? "s" : "") + "://" + cfg.http_credentials + cfg.host + 
    ":" + cfg.port;
}();

cfg.db_url = function (postfix) {
  return cfg.url + '/' + postfix;
};

module.exports = exports = cfg;