var cfg = { host: "mydb.iriscouch.com"
          , port: "80"
          , ssl:  false
          , proxy: "http://someproxy.com"
          , user: "admin"
          , pass: "admin"
          };

cfg.url = function () {
  return "http" + (cfg.ssl ? "s" : "") + "://" + cfg.http_credentials + cfg.host + 
    ":" + cfg.port;
}();

cfg.database = function(name) { return cfg.url + "/" + name; };

module.exports = exports = cfg;