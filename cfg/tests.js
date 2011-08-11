var cfg = { host: "localhost"
          , port: "5984"
          , ssl:  false // Not yet
          , user: "admin"
          , pass: "admin"
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

/*
 * Database
 *
 * @param {name} The database name
 * 
 * @return The full URL of the database
 */
cfg.database = function(name) { return cfg.url + "/" + name; };

module.exports = exports = cfg;