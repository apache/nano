var cfg = { host: "localhost"
          , port: "5984"
          , ssl:  false // Not yet
          , user: "admin"
          , pass: "admin"
          };

cfg.url = function () {
  return "http" + (cfg.ssl ? "s" : "") + "://" + cfg.http_credentials + cfg.host + 
    ":" + cfg.port;
}();

cfg.database = function(name) { return cfg.url + "/" + name; };

module.exports = exports = cfg;