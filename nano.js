/* Minimalistic Couch In Node
 *
 * Copyright 2011 Nuno Job <nunojob.com>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var request = require('request')
  , fs      = require('fs')
  , qs      = require('querystring')
  , error   = require('./error')
  , headers = { "content-type": "application/json", "accept": "application/json" }
  , nano;

/*
 * Nano is a library that helps you building requests on top of mikeals/request
 * No more, no less.
 *
 *
 * - As simple as possible, but no simpler than that
 * - It is not an ORM for CouchDB (author doesn't like ORM for DocDBs)
 * - It is not all fancy and RoR like
 * - It is not meant to prevent you from doing stupid things.
 *   Be creative. Be silly. Do stupid things. I won't thow exceptions back at you.
 *
 * Have fun! Relax, and don't forget to take the trash out. (compact)
 */

module.exports = exports = nano = function database_module(cfg) {
  var public_functions = {};
  if(typeof cfg === "string") {
    cfg = require(cfg); // No CFG? Maybe it's a file path?
  }

 /****************************************************************************
  * aux                                                                      *
  ****************************************************************************/
 /*
  * Request DB
  *
  * An auxiliary function to do the request to CouchDB
  *
  * Important Announcement: _airplane_voice_ 
  * This function is public but does not try to prevent you from shooting
  * yourself in the foot. Use only if you know _exactly_ what you are trying
  * to do. Plus if you are using it directly and it's not part of the interface
  * please consider emailing me about that, or telling me what it is, or
  * doing a pull request!
  *
  * @error {request:socket} There was a problem connecting to CouchDB
  * @error {couch:*} Any error that CouchDB returns when creating a DB
  *
  * @param {opts} The request options; e.g. {db: "test", method: "GET"}
  *        {opts.db} REQUIRED The database name
  *        {opts.method} REQUIRED The HTTP Method
  *        {opts.doc} The document URI, if any
  *        {opts.body} The body, if any
  * @param {callback} The function to callback
  *
  * @return Execution of the code in your callback. Hopefully you are handling
  */
  function request_db(opts,callback) {
    var url    = cfg.database(opts.db)
      , req    = { method: opts.method, headers: headers }
      , params = opts.params
      , status_code
      , parsed
      , rh;
    if(!callback) { callback = function () { return; }; } // Void Callback
    if(opts.doc)  { url += "/" + opts.doc; } // Add the document to the URL
    if(opts.body) { 
      if(typeof opts.body === "object") { req.body = JSON.stringify(opts.body); }
      else { req.body = opts.body; }
    }
    req.uri = url + (params ? "?" + qs.stringify(params) : "");
    request(req, function(e,h,b){
      rh = h.headers;
      status_code = h.statusCode;
      if(e) {
        callback(error.request_err(e,"socket",req,status_code),rh,b);
        return;
      }
      parsed = JSON.parse(b);
      if (status_code === 200 || status_code === 201) { callback(null,rh,parsed); }
      else { // Proxy the error
        callback(error.couch_err(parsed.reason,parsed.error,req,status_code),rh,parsed);
      }
    });
  }

 /****************************************************************************
  * db                                                                       *
  ****************************************************************************/
 /*
  * Creates a CouchDB Database
  * 
  * e.g. function recursive_retries_create_db(tried,callback) {
  *        nano.db.create(db_name, function (e,b) {
  *          if(tried.tried === tried.max_retries) {
  *            callback("Retries work");
  *            return;
  *          }
  *          else {
  *            tried.tried += 1;
  *            recursive_retries_create_db(tried,callback);
  *          }
  *        });
  *      }
  *
  * @see request_db
  */ 
  function create_db(db_name, callback) {
    request_db({db: db_name, method: "PUT"},callback);
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
  function destroy_db(db_name, callback) {
    request_db({db: db_name, method: "DELETE"},callback);
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
  function get_db(db_name, callback) {
    request_db({db: db_name, method: "GET"},callback);
  }
  
 /*
  * Lists all the databases in CouchDB
  *
  * e.g. nano.db.list(function(e,b) {
  *        console.log(b);
  *      });
  *
  * @see request_db
  */
  function list_dbs(callback) {
    request_db({db: "_all_dbs", method: "GET"},callback);
  }
  
 /****************************************************************************
  * doc                                                                      *
  ****************************************************************************/
  function document_module(db_name) {
    var public_functions = {};

   /*
    * Inserts a document in a CouchDB Database
    *
    * @see request_db
    */
    function insert_doc(doc_name,doc,callback) {
      var opts = {db: db_name};
      if(typeof doc === "function") {
        callback = doc;
        opts.body = doc_name;
        opts.method = "POST";
      }
      else {
        opts.doc = doc_name;
        opts.body = doc;
        opts.method = "PUT";
      }
      request_db(opts,callback);
    }

   /*
    * Destroy a document from CouchDB Database
    *
    * @see request_db
    */
    function destroy_doc(doc_name,rev,callback) {
      request_db({db: db_name, doc: doc_name, method: "DELETE", params: {rev: rev}},callback);
    }

   /*
    * Get's a document from a CouchDB Database
    *
    * @see request_db
    */
    function get_doc(doc_name,callback) {
      request_db({db: db_name, doc: doc_name, method: "GET"},callback);
    }

   /*
    * Lists all the documents in a CouchDB Database
    *
    * @see request_db
    */
    function list_docs(callback) {
      request_db({db: db_name, doc: "_all_docs", method: "GET"},callback);
    }

    public_functions = { db: function(cb) { get_db(db_name,cb); }
                       //, replicate: replicate_db
                       //, compact: compact_db
                       //, changes: { add: add_listener
                       //           , remove: remove_listener}
                       , insert: insert_doc
                       , get: get_doc
                       , destroy: destroy_doc
                       //, bulk: bulk_doc
                       , list: list_docs
                       };
    return public_functions;
  }

  public_functions = { db:  { create: create_db
                            , get: get_db
                            , destroy: destroy_db
                            , list: list_dbs
                            , use: document_module   // Alias
                            , scope: document_module // Alias
                            }
                     , use: document_module
                     , scope: document_module        // Alias
                     , request: request_db
                     };
  return public_functions;
};

/*
 * And now an ASCII Dinosaur
 *              _
 *            / _) ROAR! I'm a vegan!
 *     .-^^^-/ /
 *  __/       /
 * /__.|_|-|_|
 *
 */

nano.version = JSON.parse(
  fs.readFileSync(__dirname + "/package.json")).version;
nano.path    = __dirname;