/* Minimal Couch In Node
 *
 * Copyright 2011 Nuno Job <nunojob.com> (oO)--',--
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
  , _       = require('underscore')
  , error   = require('./error')
  , headers = { "content-type": "application/json" }
  , nano;

/*
 * Nano is a library that helps you building requests on top of mikeals/request
 * No more, no less.
 *
 *
 * - As simple as possible, but no simpler than that
 * - It is not an ORM for CouchDB
 * - It is not all fancy and RoR like
 * - It is not meant to prevent you from doing stupid things.
 *   Be creative. Be silly. Do stupid things. I won't thow exceptions back at you.
 *
 *   Have fun! Relax, and don't forget to compact.
 *   Dinosaurs spaceships ftw!
 */
module.exports = exports = nano = function database_module(cfg) {
  var public_functions = {};
  if(typeof cfg === "string") {
    cfg = require(cfg); // No CFG? Maybe it's a file path?
  }
  if(cfg.proxy) { // Proxy support
    request = request.defaults({proxy: cfg.proxy});
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
  * @param {opts:object} The request options; e.g. {db: "test", method: "GET"}
  *        {opts.db:string} The database name
  *        {opts.method:string} The http Method
  *        {opts.doc:string:optional} The document name
  *        {opts.att:string:optional} The attachment name
  *        {opts.content_type:string:optional} The content type, else json will be used
  *        {opts.body:object|string|binary:optional} The JSON body
  * @param {callback:function:optional} The function to callback
  *
  * @return Execution of the code in your callback. Hopefully you are handling
  */
  function relax(opts,callback) {
    var url    = cfg.database(opts.db)
      , req    = { method: opts.method, headers: headers }
      , params = opts.params
      , status_code
      , parsed
      , rh;
    if(!callback) { callback = function () { return; }; } // Void Callback
    if(opts.doc)  { 
      url += "/" + opts.doc; // Add the document to the URL
      if(opts.att) { url += "/" + opts.att; } // Add the attachment to the URL
    } 
    if(opts.content_type) { req.headers["content-type"] = opts.content_type; }
    if(opts.body) { 
      if(typeof opts.body === "object") { req.body = JSON.stringify(opts.body); }
      else { req.body = opts.body; } // String or binary
    }
    req.uri = url + (_.isEmpty(params) ? "" : "?" + qs.stringify(params));
    request(req, function(e,h,b){
      if(e) {
        callback(error.request_err(e,"socket",req,status_code),{},b);
        return;
      }
      rh = h.headers;
      status_code = h.statusCode;
      parsed = JSON.parse(b);
      if (status_code === 200 || status_code === 201 || status_code === 202) { 
        callback(null,rh,parsed); 
      }
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
  * http://wiki.apache.org/couchdb/HTTP_database_API
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
  * @param {db_name:string} The name of the database
  *
  * @see relax
  */ 
  function create_db(db_name, callback) {
    relax({db: db_name, method: "PUT"},callback);
  }
  
 /*
  * Annihilates a CouchDB Database
  *
  * e.g. nano.db.delete(db_name);
  *
  * Even though this looks sync it is an async function
  * and therefor order is not guaranteed
  *
  * @param {db_name:string} The name of the database
  *
  * @see relax
  */
  function destroy_db(db_name, callback) {
    relax({db: db_name, method: "DELETE"},callback);
  }

 /*
  * Gets information about a CouchDB Database
  *
  * e.g. nano.db.get(db_name, function(e,b) {
  *        console.log(b);
  *      });
  *
  * @param {db_name:string} The name of the database
  *
  * @see relax
  */
  function get_db(db_name, callback) {
    relax({db: db_name, method: "GET"},callback);
  }
  
 /*
  * Lists all the databases in CouchDB
  *
  * e.g. nano.db.list(function(e,b) {
  *        console.log(b);
  *      });
  *
  * @see relax
  */
  function list_dbs(callback) {
    relax({db: "_all_dbs", method: "GET"},callback);
  }

 /*
  * Compacts a CouchDB Database
  *
  * e.g. nano.db.compact(db_name);
  *
  * @param {db_name:string} The name of the database
  *
  * @see relax
  */
  function compact_db(db_name, callback) {
    relax({db: db_name, doc: "_compact", method: "POST"},callback);
  }

 /*
  * Replicates a CouchDB Database
  *
  * e.g. nano.db.replicate(db_1, db_2);
  *
  * @param {source:string} The name of the source database
  * @param {target:string} The name of the target database
  * @param {continuous:bool:optional} Turn on continuous replication
  * 
  * @see relax
  */
  function replicate_db(source, target, continuous, callback) {
    if(typeof continuous === "function") {
      callback   = continuous;
      continuous = false;
    }
    var body = {source: source, target: target};
    if(continuous) { body.continuous = true; }
    relax({db: "_replicate", body: body, method: "POST"},callback);
  }
 
 /*
  * Returns the CouchDB + Nano Configuration
  *
  * @see relax
  */
  function config(callback) {
    relax({db: "_config", method: "GET"}, function (e,h,r) {
      if(e) { callback(e); }
      callback(null,h,{nano: cfg, couch: r});
    });
  }

 /****************************************************************************
  * doc                                                                      *
  ****************************************************************************/
  function document_module(db_name) {
    var public_functions = {};

   /*
    * Inserts a document in a CouchDB Database
    * http://wiki.apache.org/couchdb/HTTP_Document_API
    *
    * @param {doc:object|string} The document
    * @param {doc_name:string:optional} The name of the document
    *
    * @see relax
    */
    function insert_doc(doc,doc_name,callback) {
      var opts = {db: db_name, body: doc, method: "POST"};
      if(doc_name) {
        if(typeof doc_name === "function") {
          callback = doc_name;
        }
        else {
          opts.doc = doc_name;
          opts.method = "PUT";
        }
      }
      relax(opts,callback);
    }

   /*
    * Updates a document in a CouchDB Database
    *
    *
    * @param {doc_name:string} The name of the document
    * @param {rev:string} The previous document revision    
    * @param {doc:object|string} The document
    *
    * @see relax
    */
    function update_doc(doc_name,rev,doc,callback) {
      doc._rev = rev;
      relax({ db: db_name, doc: doc_name, method: "PUT", body: doc},callback);
    }

   /*
    * Destroy a document from CouchDB Database
    *
    * @param {doc_name:string} The name of the document
    * @param {rev:string} The previous document revision
    *
    * @see relax
    */
    function destroy_doc(doc_name,rev,callback) {
      relax({db: db_name, doc: doc_name, method: "DELETE", params: {rev: rev}},
        callback);
    }

   /*
    * Get's a document from a CouchDB Database
    *
    * e.g. db2.get("foo", {revs_info: true}, function (e,h,b) {
    *        console.log(e,h,b);
    *        return;
    *      });
    *
    * @param {doc_name:string} The name of the document
    * @param {params:object:optional} Additions to the querystring
    *
    * @see relax
    */
    function get_doc(doc_name,params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      relax({db: db_name, doc: doc_name, method: "GET", params: params},callback);
    }

   /*
    * Lists all the documents in a CouchDB Database
    *
    * @param {params:object:optional} Additions to the querystring
    *
    * @see get_doc
    * @see relax
    */
    function list_docs(params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      relax({db: db_name, doc: "_all_docs", method: "GET", params: params},callback);
    }
   
   /*
    * Bulk update/delete/insert functionality
    * http://wiki.apache.org/couchdb/HTTP_Bulk_Document_API
    *
    * @param {docs:object} The documents as per the CouchDB API (check link)
    *
    * @see get_doc
    * @see relax
    */
    function bulk_docs(docs,callback) {
      relax({db: db_name, doc: "_bulk_docs", body: docs, method: "POST"},callback);
    }

   /**************************************************************************
    * attachment                                                             *
    **************************************************************************/
   /*
    * Inserting an attachment
    * http://wiki.apache.org/couchdb/HTTP_Document_API
    *
    * e.g. 
    * db.attachment.insert("new", "att", buffer, "image/bmp", {rev: b.rev},
    *   function(_,_,response) {
    *     console.log(response);
    * });
    *
    * Don't forget that params.rev is required in all cases except when
    * creating a new document with a new attachment via this method
    *
    * @param {doc_name:string} The name of the document
    * @param {att_name:string} The name of the attachment
    * @param {att:buffer} The attachment data
    * @param {content_type:string} The attachment content type
    * @param {params:object:optional} Additions to the querystring
    *
    * @see relax
    */
    function insert_att(doc_name,att_name,att,content_type,params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      relax({ db: db_name, att: att_name, method: "PUT", content_type: content_type
            , doc: doc_name, params: params, body: att},callback);
    }

   /*
    * Get an attachment
    *
    * @param {doc_name:string} The name of the document
    * @param {att_name:string} The name of the attachment
    * @param {params:object:optional} Additions to the querystring
    *
    * @see relax
    */
    function get_att(doc_name,att_name,params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      relax({ db: db_name, att: att_name, method: "GET"
            , doc: doc_name, params: params},callback);
    }

   /*
    * Destroy an attachment
    *
    * @param {doc_name:string} The name of the document
    * @param {att_name:string} The name of the attachment
    * @param {rev:string} The document last revision
    *
    * @see relax
    */
    function destroy_att(doc_name,att_name,rev,callback) {
      relax({ db: db_name, att: att_name, method: "DELETE"
            , doc: doc_name, params: {rev: rev}},callback);
    }

    public_functions = { info: function(cb) { get_db(db_name,cb); }
                       , replicate: function(target,continuous,cb) {
                           if(typeof continuous === "function") {
                             cb         = continuous;
                             continuous = false;
                           }
                           replicate_db(db_name,target,continuous,cb); 
                         }
                       , compact: function(cb) { compact_db(db_name,cb); }
                       // hook.io? socket.io?
                       //, changes: { add: add_listener
                       //           , remove: remove_listener}
                       , insert: insert_doc
                       , update: update_doc
                       , get: get_doc
                       , destroy: destroy_doc
                       , bulk: bulk_docs
                       , list: list_docs
                       //, views: {}
                       , attachment: { insert: insert_att
                                     , get: get_att
                                     , destroy: destroy_att
                                     }
                       };
    return public_functions;
  }

  public_functions = { db:  { create: create_db
                            , get: get_db
                            , destroy: destroy_db
                            , list: list_dbs
                            , use: document_module   // Alias
                            , scope: document_module // Alias
                            , compact: compact_db
                            , replicate: replicate_db
                            }
                     , use: document_module
                     , scope: document_module        // Alias
                     , request: relax
                     , config: config
                     , relax: relax                  // Alias
                     , dinosaur: relax               // Alias
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
 * Thanks for visiting! Come Again!
 */

nano.version = JSON.parse(
  fs.readFileSync(__dirname + "/package.json")).version;
nano.path    = __dirname;