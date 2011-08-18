var cfg = { host: "mydb.iriscouch.com"
          , port: "80"
          , ssl:  false
          , proxy: "http://someproxy.com"
          , user: "admin"
          , pass: "admin"
          };

cfg.credentials = function credentials() {
  if (cfg.user && cfg.pass) {
    return cfg.user + ":" + cfg.pass + "@";
  }
  else { return ""; }
}();

cfg.url = function () {
  return "http" + (cfg.ssl ? "s" : "") + "://" + cfg.credentials + cfg.host + 
    ":" + cfg.port;
}();

cfg.database = function(name) { return cfg.url + "/" + name; };

module.exports = exports = cfg;