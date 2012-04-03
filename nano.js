/* minimal couch in node
 *
 * copyright 2011 nuno job <nunojob.com> (oO)--',--
 *
 * licensed under the apache license, version 2.0 (the "license");
 * you may not use this file except in compliance with the license.
 * you may obtain a copy of the license at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * unless required by applicable law or agreed to in writing, software
 * distributed under the license is distributed on an "as is" basis,
 * without warranties or conditions of any kind, either express or implied.
 * see the license for the specific language governing permissions and
 * limitations under the license.
 */
var request     = require('request')
  , fs          = require('fs')
  , qs          = require('querystring')
  , u           = require('url')
  , error       = require('./error')
  , nano
  ;

function isEmpty(object) {
  for(var property in object) {
    if(object.hasOwnProperty(property)) return false; }
  return true;
}

/*
 * nano is a library that helps you building requests to couchdb
 * that is built on top of mikeal/request
 *
 * no more, no less
 * be creative. be silly. have fun! relax (and don't forget to compact).
 *
 * dinosaurs spaceships!
 */
module.exports = exports = nano = function database_module(cfg) {
  var public_functions = {}
    , request_opts     = {}
    , logging
    , path
    , path_array
    , db
    , auth
    , port
    ;

 /****************************************************************************
  * relax                                                                    *
  ***************************************************************************/
 /*
  * relax
  *
  * base for all request using nano
  * this function assumes familiarity with the couchdb api
  *
  * e.g.
  * nano.request( { db: "alice"
  *               , doc: "rabbit"
  *               , method: "GET"
  *               , params: { rev: "1-967a00dff5e02add41819138abb3284d"}
  *               },
  *   function (_,b) { console.log(b) });
  *
  * @error {request:socket} problem connecting to couchdb
  * @error {couch:*} an error proxied from couchdb
  *
  * @param {opts:object|string} request options; 
  *          e.g. {db: "test", method: "GET"}
  *        {opts.db:string} database name
  *        {opts.method:string:optional} http method, defaults to "GET"
  *        {opts.path:string:optional} a full path, override `doc` and `att`
  *        {opts.doc:string:optional} document name
  *        {opts.att:string:optional} attachment name
  *        {opts.content_type:string:optional} content type, default to json
  *        {opts.body:object|string|binary:optional} document or attachment body
  *        {opts.encoding:string:optional} encoding for attachments
  * @param {callback:function:optional} function to call back
  */
  function relax(opts,callback) {
    if(typeof opts === 'string') { opts = {path: opts}; }
    var log = logging();
    var headers = { "content-type": "application/json"
                  , "accept"      : "application/json"
                  }
      , req     = { method : (opts.method || "GET")
                  , headers: headers
                  , uri    : cfg.url }
      , params  = opts.params
      , status_code
      , parsed
      , rh
      ;

    if (opts.jar) { req.jar = opts.jar; }
    if(opts.db) { req.uri += "/" + opts.db; }
    if(opts.path) { req.uri += "/" + opts.path; }
    else if(opts.doc)  {
      if(!/^_design/.test(opts.doc)) {
        try { req.uri += "/" + encodeURIComponent(opts.doc); }
        catch (ex1) {
          ex1.message = 'couldnt encode: ' + opts.doc + ' as an uri';
          return error.request_err(ex, 'encodeuri', {});
        }
      }
      else {
        req.uri += "/" + opts.doc;
      }
      if(opts.att) { req.uri += "/" + opts.att; }
    }
    if(opts.encoding !== undefined && callback) {
      req.encoding = opts.encoding;
      delete req.headers["content-type"];
      delete req.headers.accept;
    }
    if(opts.content_type) {
      req.headers["content-type"] = opts.content_type;
      delete req.headers.accept; // undo headers set
    }
    if(!isEmpty(params)) {
      ['startkey', 'endkey', 'key', 'keys'].forEach(function (key) {
        if (key in params) {
          try { params[key] = JSON.stringify(params[key]); }
          catch (ex2) { 
            ex2.message = 'bad params: ' + key + ' = ' + params[key];
            return error.request_err(ex, 'jsonstringify', {}); 
          }
        }
      });
      try { req.uri += "?" + qs.stringify(params); }
      catch (ex3) {
        ex3.message = 'invalid params: ' + params.toString();
        return error.request_err(ex3, 'qsstringify', {});
      }
    }
    if(!callback) { // void callback, stream
      try {
        return request(req);
      } catch (ex4) { 
        return error.request_err(ex4, 'streamthrow', {});
      }
    }
    if(opts.body) {
      if (Buffer.isBuffer(opts.body)) {
        req.body = opts.body; // raw data
      }
      else {
        try {
          req.body = JSON.stringify(opts.body, function (key, value) {
            if (typeof(value) === 'function') {
              return value.toString();
            } else {
              return value;
            }
          });
        } catch (ex5) { 
          ex5.message = "couldn't json.stringify the body you provided";
          return error.request_err(ex5, 'jsonstringify', {}, callback);
        }
      } // json data
    }
    log(req);
    try {
      var stream = request(req, function(e,h,b){
        rh = (h && h.headers || {});
        rh['status-code'] = status_code = (h && h.statusCode || 500);
        rh.uri            = req.uri;
        if(e) {
          log({err: 'socket', body: b, headers: rh });
          callback(error.request(e,"socket",req,status_code),b,rh);
          return stream;
        }
        delete rh.server;
        delete rh['content-length'];
        try { parsed = JSON.parse(b); } catch (err) { parsed = b; }
        if (status_code >= 200 && status_code < 300) {
          log({err: null, body: parsed, headers: rh});
          callback(null,parsed,rh);
          return stream;
        }
        else { // proxy the error directly from couchdb
          log({err: 'couch', body: parsed, headers: rh});
          if (!parsed) { parsed = {}; }
          callback(error.couch(parsed.reason,parsed.error,req,status_code),
            parsed, rh);
          return stream;
        }
      });
      return stream;
    } catch(ex6) { 
      return error.request_err(ex6, 'callbackthrow', {});
    }
  }

 /****************************************************************************
  * db                                                                       *
  ***************************************************************************/
 /*
  * creates a couchdb database
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
  * @param {db_name:string} database name
  *
  * @see relax
  */
  function create_db(db_name, callback) {
    return relax({db: db_name, method: "PUT"},callback);
  }

 /*
  * annihilates a couchdb database
  *
  * e.g. nano.db.destroy(db_name);
  *
  * even though this examples looks sync it is an async function
  *
  * @param {db_name:string} database name
  *
  * @see relax
  */
  function destroy_db(db_name, callback) {
    return relax({db: db_name, method: "DELETE"},callback);
  }

 /*
  * gets information about a couchdb database
  *
  * e.g. nano.db.get(db_name, function(e,b) {
  *        console.log(b);
  *      });
  *
  * @param {db_name:string} database name
  *
  * @see relax
  */
  function get_db(db_name, callback) {
    return relax({db: db_name, method: "GET"},callback);
  }

 /*
  * lists all the databases in couchdb
  *
  * e.g. nano.db.list(function(e,b) {
  *        console.log(b);
  *      });
  *
  * @see relax
  */
  function list_dbs(callback) {
    return relax({db: "_all_dbs", method: "GET"},callback);
  }

 /*
  * compacts a couchdb database
  *
  * e.g. nano.db.compact(db_name);
  *
  * @param {db_name:string} database name
  * @param {design_name:string:optional} design document name
  *
  * @see relax
  */
  function compact_db(db_name, design_name, callback) {
    if(typeof design_name === "function") {
      callback = design_name;
      design_name = null;
    }
    return relax({db: db_name, doc: "_compact", att: design_name, method: "POST"},callback);
  }

 /*
  * couchdb database _changes feed
  *
  * e.g. nano.db.changes(db_name, {since: 2}, function (e,r,h) {
  *        console.log(r);
  *      });
  *
  * @param {db_name:string} database name
  * @param {params:object:optional} additions to the querystring
  *
  * @see relax
  */
  function changes_db(db_name, params, callback) {
    if(typeof params === "function") {
      callback = params;
      params = {};
    }
    return relax({db: db_name, path: "_changes", params: params, method: "GET"},callback);
  }

 /*
  * replicates a couchdb database
  *
  * e.g. nano.db.replicate(db_1, db_2);
  *
  * @param {source:string} name of the source database
  * @param {target:string} name of the target database
  * @param {opts:object:optional} options to the replicator
  *
  * @see relax
  */
  function replicate_db(source, target, opts, callback) {
    if(typeof opts === "function") {
      callback  = opts;
      opts      = {};
    }
    opts.source = source;
    opts.target = target;
    return relax({db: "_replicate", body: opts, method: "POST"}, callback);
  }

 /****************************************************************************
  * doc                                                                      *
  ***************************************************************************/
  function document_module(db_name) {
    var public_functions = {};

   /*
    * inserts a document in a couchdb database
    * http://wiki.apache.org/couchdb/HTTP_Document_API
    *
    * @param {doc:object|string} document body
    * @param {doc_name:string:optional} document name
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
      return relax(opts,callback);
    }

   /*
    * destroy a document from a couchdb database
    *
    * @param {doc_name:string} document name
    * @param {rev:string} previous document revision
    *
    * @see relax
    */
    function destroy_doc(doc_name,rev,callback) {
      return relax({db: db_name, doc: doc_name, method: "DELETE", params: {rev: rev}},
        callback);
    }

   /*
    * get a document from a couchdb database
    *
    * e.g. db2.get("foo", {revs_info: true}, function (e,b,h) {
    *        console.log(e,b,h);
    *        return;
    *      });
    *
    * @param {doc_name:string} document name
    * @param {params:object:optional} additions to the querystring
    *
    * @see relax
    */
    function get_doc(doc_name,params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      return relax({db: db_name, doc: doc_name, method: "GET", params: params},callback);
    }

   /*
    * lists all the documents in a couchdb database
    *
    * @param {params:object:optional} additions to the querystring
    *
    * @see get_doc
    * @see relax
    */
    function list_docs(params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      return relax({db: db_name, path: "_all_docs", method: "GET", params: params},callback);
    }

   /*
    * bulk fetch functionality
    * [1]: http://wiki.apache.org/couchdb/HTTP_Bulk_Document_API
    *
    * @param {doc_names:object} document keys as per the couchdb api[1]
    * @param {params:object} additions to the querystring, note that include_docs is always set to true
    *
    * @see get_doc
    * @see relax
    */
    function fetch_docs(doc_names,params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      params.include_docs = true;
      return relax({db: db_name, path: "_all_docs", method: "POST", params: params, body: doc_names},callback);
    }

   /*
    * calls a view
    *
    * @param {design_name:string} design document name
    * @param {view_name:string} view to call
    * @param {params:object:optional} additions to the querystring
    *
    * @see relax
    */
    function view_docs(design_name,view_name,params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      var view_path = '_design/' + design_name + '/_view/'  + view_name;
      if (params.keys) {
        var body = {keys: params.keys};
        delete params.keys;
        return relax({db: db_name, path: view_path
                     , method: "POST", params: params, body: body}, callback);
      }
      else {
        return relax({db: db_name, path: view_path
                     , method: "GET", params: params},callback);
      }
    }

   /*
    * calls document update handler design document
    *
    *
    * @param {design_name:string} design document namd
    * @param {update_name:string} update method to call
    * @param {doc_name:string} document name to update
    * @param {params:object} additions to the querystring
   */
   function update_with_handler_doc(design_name, update_name, 
     doc_name, params, callback) {
     if(typeof params === "function") {
       callback = params;
       params   = {};
     }
     var update_path = '_design/' + design_name + '/_update/' + 
       update_name + '/' + doc_name;
     return relax(
       { db: db_name, path: update_path, method: "PUT"
       , body: params }, callback);
   }

   /*
    * bulk update/delete/insert functionality
    * [1]: http://wiki.apache.org/couchdb/HTTP_Bulk_Document_API
    *
    * @param {docs:object} documents as per the couchdb api[1]
    * @param {params:object} additions to the querystring
    *
    * @see get_doc
    * @see relax
    */
    function bulk_docs(docs,params,callback) {
     if(typeof params === "function") {
       callback = params;
       params = {};
     }
     return relax(
       { db: db_name, path: "_bulk_docs", body: docs
       , method: "POST", params: params}, callback);
    }

   /**************************************************************************
    * attachment                                                             *
    *************************************************************************/
   /*
    * inserting an attachment
    * [2]: http://wiki.apache.org/couchdb/HTTP_Document_API
    *
    * e.g.
    * db.attachment.insert("new", "att", buffer, "image/bmp", {rev: b.rev},
    *   function(_,response) {
    *     console.log(response);
    * });
    *
    * don't forget that params.rev is required in most cases. only exception
    * is when creating a new document with a new attachment. consult [2] for
    * details
    *
    * @param {doc_name:string} document name
    * @param {att_name:string} attachment name
    * @param {att:buffer} attachment data
    * @param {content_type:string} attachment content-type
    * @param {params:object:optional} additions to the querystring
    *
    * @see relax
    */
    function insert_att(doc_name,att_name,att,content_type,params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      return relax(
        { db: db_name, att: att_name, method: "PUT"
        , content_type: content_type, doc: doc_name, params: params
        , body: att}, callback);
    }

   /*
    * get an attachment
    *
    * @param {doc_name:string} document name
    * @param {att_name:string} attachment name
    * @param {params:object:optional} additions to the querystring
    *
    * @see relax
    */
    function get_att(doc_name,att_name,params,callback) {
      if(typeof params === "function") {
        callback = params;
        params   = {};
      }
      return relax({ db: db_name, att: att_name, method: "GET", doc: doc_name
                   , params: params, encoding: null},callback);
    }

   /*
    * destroy an attachment
    *
    * @param {doc_name:string} document name
    * @param {att_name:string} attachment name
    * @param {rev:string} previous document revision
    *
    * @see relax
    */
    function destroy_att(doc_name,att_name,rev,callback) {
      return relax({ db: db_name, att: att_name, method: "DELETE"
                  , doc: doc_name, params: {rev: rev}},callback);
    }

    public_functions = { info: function(cb) { return get_db(db_name,cb); }
                       , replicate: function(target,opts,cb) {
                           return replicate_db(db_name,target,opts,cb);
                         }
                       , compact: function(cb) { 
                           return compact_db(db_name,cb); 
                         }
                       , changes: function(params,cb) {
                           return changes_db(db_name,params,cb);
                         }
                       , insert: insert_doc
                       , get: get_doc
                       , destroy: destroy_doc
                       , bulk: bulk_docs
                       , list: list_docs
                       , fetch: fetch_docs
                       , config: {url: cfg.url, db: db_name}
                       , attachment: { insert: insert_att
                                     , get: get_att
                                     , destroy: destroy_att
                                     }
                       , updateWithHandler: update_with_handler_doc
                       };
    public_functions.view = view_docs;
    public_functions.view.compact = function(design_name,cb) {
      return compact_db(db_name,design_name,cb);
    };
    return public_functions;
  }

  public_functions = { db:  { create: create_db
                            , get: get_db
                            , destroy: destroy_db
                            , list: list_dbs
                            , use: document_module   // alias
                            , scope: document_module // alias
                            , compact: compact_db
                            , replicate: replicate_db
                            , changes: changes_db
                            }
                     , use: document_module
                     , scope: document_module        // alias
                     , request: relax
                     , relax: relax                  // alias
                     , dinosaur: relax               // alias
                     };

  if(typeof cfg === "string") {
    if(/^https?:/.test(cfg)) { cfg = {url: cfg}; } // url
    else {
      try { cfg   = require(cfg); } // file path
      catch(e) {
        e.message = "couldn't read config file " + 
          (cfg ? cfg.toString() : '');
        throw error.init(e, "badfile");
      }
    }
  }
  
  if(!(cfg && cfg.url))
    throw error.init("no configuration with a valid url was given", "badurl");

  public_functions.config = cfg;

  if(cfg.proxy || cfg.jar) {
    if(cfg.proxy) 
      request_opts.proxy = cfg.proxy;
    request_opts.jar     = !!cfg.jar;
    request              = require('request').defaults(request_opts);
  }
  
  // assuming a cfg.log inside cfg
  logging = require('./logging')(cfg);
  
  try { 
    path       = u.parse(cfg.url);
    path_array = path.pathname.split('/').filter(function(e) { return e; });
  }
  catch (e2) {
    e2.message = "your url is invalid: " + cfg.url;
    throw error.init(e2, "invalidurl");
  }
  
  // nano('http://couch.nodejitsu.com/db1') should return a database
  // nano('http://couch.nodejitsu.com')     should return a nano object
  if(path.pathname && path_array.length > 0) {
    auth    = path.auth ? path.auth + '@' : '';
    port    = path.port ? ':' + path.port : '';
    db      = path_array[0];
    cfg.url = u.format(
      {protocol:path.protocol,host: auth + path.hostname + port});
    return document_module(db);
  }
  else   { return public_functions; }

};

/*
 * and now an ascii dinosaur
 *              _
 *            / _) ROAR! i'm a vegan!
 *     .-^^^-/ /
 *  __/       /
 * /__.|_|-|_|
 *
 * thanks for visiting! come again!
 *
 * LH1059-A321
 * LH1178-A321
 */

nano.version = JSON.parse(
  fs.readFileSync(__dirname + "/package.json")).version;
nano.path    = __dirname;