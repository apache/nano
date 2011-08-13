/* Minimalistic Couch In Node */
var request = require('request')
  , fs      = require('fs')
  , error   = require('./error')
  , headers = { "content-type": "application/json"
              , "accept": "application/json"
              }
  , nano;

module.exports = exports = nano = function nano_module(cfg) {
  var public_functions = {};
  if(typeof cfg === "string") {
    cfg = require(cfg); // No CFG? Maybe it's a file path?
  }

 /*
  * Request DB
  *
  * An auxiliary function to do the request to CouchDB
  *
  * @error {request:connect_db} There was a problem connecting to CouchDB
  * @error {couch:*} Any error that CouchDB returns when creating a DB
  *
  * @param {opts} The request options; e.g. {db: "test", method: "GET"}
  * @param {callback} The function to callback
  *
  * @return Execution of the code in your callback. Hopefully you are handling
  */
  function request_db(opts,callback) {
    var url = cfg.database(opts.db)
      , req
      , status_code
      , parsed;
    if(!callback) { callback = function () { return; }; } // Void Callback
    if(opts.doc) { url += "/" + opts.doc; } // Add the document to the URL
    req = 
      { uri: url
      , method: opts.method
      , headers: headers 
      };
    request(req, function(e,h,b){
      status_code = h.statusCode;
      if(e) {
        callback(error.request_err(e,"connect_db",req,status_code));
        return;
      }
      parsed = JSON.parse(b);
      if (status_code === 200 || status_code === 201) { callback(null,parsed); }
      else { // Proxy the error
        callback(error.couch_err(parsed.reason,parsed.error,req,status_code));
      }
    });
  }

 /*
  * Creates a CouchDB Database
  * 
  * e.g. nano.db.create(db_name, function (e,b) {
  *        if(tried.tried === tried.max_retries) {
  *          callback("Retries work");
  *          return;
  *        }
  *        else {
  *          tried.tried += 1;
  *          recursive_retries_create_db(tried,callback);
  *        }
  *      });
  *
  * @see request_db
  */ 
  function create_db(name, callback) {
    request_db({db: name, method: "PUT"},callback);
  }
  
 /*
  * Annihilates a CouchDB Database
  *
  * e.g. nano.db.delete(db_name);
  *
  * Even though this looks sync it is an async function
  * and therefor order is not guaranteed
  *
  * @see request_db
  */
  function destroy_db(name, callback) {
    request_db({db: name, method: "DELETE"},callback);
  }

 /*
  * Gets information about a CouchDB Database
  *
  * e.g. nano.db.get(db_name, function(e,b) {
  *        console.log(b);
  *      });
  *
  * @see request_db
  */
  function get_db(name, callback) {
    request_db({db: name, method: "GET"},callback);
  }
  
 /*
  * Lists all the databases in CouchDB
  *
  * e.g. nano.db.get(db_name, function(e,b) {
  *        console.log(b);
  *      });
  *
  * @see request_db
  */
  function list_dbs(callback) {
    request_db({db: "_all_dbs", method: "GET"},callback);
  }

  public_functions = { db:  { create: create_db
                            , get: get_db
                            , destroy: destroy_db
                            , list: list_dbs
                            //, replicate: replicate_db
                            //, compact: compact_db
                            //, changes: { add: add_listener
                            //           , remove: remove_listener}
                            }
                     //, create: create_doc
                     //, get: get_doc
                     //, destroy: destroy_doc
                     //, bulk: bulk_doc
                     //, list: list_docs
                     };

  return public_functions;
};

nano.version = JSON.parse(
  fs.readFileSync(__dirname + "/package.json")).version;
nano.path    = __dirname;