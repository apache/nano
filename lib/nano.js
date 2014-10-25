'use strict';

var u = require('url');
var assert = require('assert');
var querystring = require('querystring');
var request = require('request');
var errs = require('errs');
var _ = require('underscore');
var follow = require('follow');
var logger = require('./logger');

var nano;

module.exports = exports = nano = function dbScope(cfg) {
  var serverScope = {};

  if (typeof cfg === 'string') {
    cfg = {url: cfg};
  }

  assert.equal(typeof cfg, 'object',
    'You must specify the endpoint url when invoking this module');
  assert.ok(/^https?:/.test(cfg.url), 'url is not valid');

  cfg = _.clone(cfg);

  serverScope.config = cfg;
  cfg.requestDefaults = cfg.requestDefaults || {jar: false};

  var httpAgent = (typeof cfg.request === 'function') ? cfg.request :
    request.defaults(cfg.requestDefaults);

  var log = typeof cfg.log === 'function' ? cfg.log : logger(cfg);

  function relax(opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {path: ''};
    }

    if (typeof opts === 'string') {
      opts = {path: opts};
    }

    if (!opts) {
      opts = {path: ''};
      callback = null;
    }

    var qs = _.extend({}, opts.qs);

    var headers = {
      'content-type': 'application/json',
      accept: 'application/json'
    };

    var req = {
      method: (opts.method || 'GET'),
      headers: headers,
      uri: cfg.url
    };

    var statusCode;
    var parsed;
    var rh;

    // https://github.com/mikeal/request#requestjar
    if (opts.jar) {
      req.jar = opts.jar;
    }

    // http://wiki.apache.org/couchdb/HTTP_database_API#Naming_and_Addressing
    if (opts.db) {
      req.uri = u.resolve(req.uri, encodeURIComponent(opts.db));
    }

    if (opts.multipart) {
      req.multipart = opts.multipart;
    }

    req.headers = _.extend(req.headers, opts.headers, cfg.defaultHeaders);

    if (opts.path) {
      req.uri += '/' + opts.path;
    }
    else if (opts.doc) {
      // http://wiki.apache.org/couchdb/HTTP_Document_API#Naming.2FAddressing
      if (!/^_design/.test(opts.doc)) {
        req.uri += '/' + encodeURIComponent(opts.doc);
      }
      // http://wiki.apache.org/couchdb/HTTP_Document_API#Document_IDs
      else {
        req.uri += '/' + opts.doc;
      }

      // http://wiki.apache.org/couchdb/HTTP_Document_API#Attachments
      if (opts.att) {
        req.uri += '/' + opts.att;
      }
    }

    // prevent bugs where people set encoding when piping
    if (opts.encoding !== undefined && callback) {
      req.encoding = opts.encoding;
      delete req.headers['content-type'];
      delete req.headers.accept;
    }

    if (opts.contentType) {
      req.headers['content-type'] = opts.contentType;
      delete req.headers.accept;
    }

    // http://guide.couchdb.org/draft/security.html#cookies
    if (cfg.cookie) {
      req.headers['X-CouchDB-WWW-Authenticate'] = 'Cookie';
      req.headers.cookie = cfg.cookie;
    }

    // http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
    if (typeof opts.qs === 'object' && !_.isEmpty(opts.qs)) {
      ['startkey', 'endkey', 'key', 'keys'].forEach(function(key) {
        if (key in opts.qs) {
          qs[key] = JSON.stringify(opts.qs[key]);
        }
      });
      req.qs = qs;
    }

    if (opts.body) {
      if (Buffer.isBuffer(opts.body) || opts.dontStringify) {
        req.body = opts.body;
      }
      else {
        req.body = JSON.stringify(opts.body, function(key, value) {
          // don't encode functions
          if (typeof(value) === 'function') {
            return value.toString();
          } else {
            return value;
          }
        });
      }
    }

    if (opts.form) {
      req.headers['content-type'] =
        'application/x-www-form-urlencoded; charset=utf-8';
      req.body = querystring.stringify(opts.form).toString('utf8');
    }

    log(req);

    if (!callback) {
      return httpAgent(req);
    }

    return httpAgent(req, function(e, h, b) {
      rh = (h && h.headers || {});
      rh.statusCode = (h && h.statusCode || 500);
      rh.uri = req.uri;

      if (e) {
        log({err: 'socket', body: b, headers: rh});
        errs.handle(errs.merge(e, {
          message: 'error happened in your connection',
          scope: 'socket',
          errid: 'request'
        }), callback);
        return;
      }

      delete rh.server;
      delete rh['content-length'];

      if (opts.dontParse) {
        parsed = b;
      } else {
        try { parsed = JSON.parse(b); } catch (err) { parsed = b; }
      }

      if (rh.statusCode >= 200 && rh.statusCode < 400) {
        log({err: null, body: parsed, headers: rh});

        callback(null, parsed, rh);
      }
      else { // proxy the error directly from couchdb
        log({err: 'couch', body: parsed, headers: rh});

        if (!parsed) {
          parsed = {};
        }

        // cloudant stacktrace
        if (typeof parsed === 'string') {
          parsed = {message: parsed};
        }
        if (!parsed.message && (parsed.reason || parsed.error)) {
          parsed.message = (parsed.reason || parsed.error);
        }
        // fix cloudant issues where they give an erlang stacktrace as js
        delete parsed.stack;

        errs.handle(errs.merge(errs.create(parsed), {
          scope: 'couch',
          statusCode: rh.statusCode,
          request: req,
          headers: rh,
          errid: 'non_200',
          message: parsed.reason || 'couch returned ' + statusCode
        }), callback);
      }
    });
  }

  // http://docs.couchdb.org/en/latest/api/server/authn.html#cookie-authentication
  function auth(username, password, callback) {
    return relax({
      method: 'POST',
      db: '_session',
      form: {
        name: username,
        password: password
      }
    }, callback);
  }

  // http://docs.couchdb.org/en/latest/api/server/authn.html#post--_session
  function session(callback) {
    return relax({db: '_session'}, callback);
  }

  // http://docs.couchdb.org/en/latest/api/server/common.html#get--_db_updates
  function updates(qs, callback) {
    if (typeof qs === 'function') {
      callback = qs;
      qs = {};
    }
    return relax({
      db: '_db_updates',
      qs: qs
    }, callback);
  }

  function followUpdates(qs, callback) {
    return followDb('_db_updates', qs, callback);
  }

  // http://docs.couchdb.org/en/latest/api/database/common.html#put--db
  function createDb(dbName, callback) {
    return relax({db: dbName, method: 'PUT'}, callback);
  }

  // http://docs.couchdb.org/en/latest/api/database/common.html#delete--db
  function destroyDb(dbName, callback) {
    return relax({db: dbName, method: 'DELETE'}, callback);
  }

  // http://docs.couchdb.org/en/latest/api/database/common.html#get--db
  function getDb(dbName, callback) {
    return relax({db: dbName}, callback);
  }

  // http://docs.couchdb.org/en/latest/api/server/common.html#get--_all_dbs
  function listDbs(callback) {
    return relax({db: '_all_dbs'}, callback);
  }

  // http://docs.couchdb.org/en/latest/api/database/compact.html#post--db-_compact
  function compactDb(dbName, ddoc, callback) {
    if (typeof ddoc === 'function') {
      callback = ddoc;
      ddoc = null;
    }
    return relax({
      db: dbName,
      doc: '_compact',
      att: ddoc,
      method: 'POST'
    }, callback);
  }

  // http://docs.couchdb.org/en/latest/api/database/changes.html#get--db-_changes
  function changesDb(dbName, qs, callback) {
    if (typeof qs === 'function') {
      callback = qs;
      qs = {};
    }
    return relax({db: dbName, path: '_changes', qs: qs}, callback);
  }

  function followDb(dbName, qs, callback) {
    if (typeof qs === 'function') {
      callback = qs;
      qs = {};
    }

    qs = qs || {};
    qs.db = u.resolve(cfg.url, encodeURIComponent(dbName));

    if (typeof callback === 'function') {
      return follow(qs, callback);
    } else {
      return new follow.Feed(qs);
    }
  }

  function _serializeAsUrl(db) {
    if (typeof db === 'object' && db.config && db.config.url && db.config.db) {
      return u.resolve(db.config.url, encodeURIComponent(db.config.db));
    } else {
      return db;
    }
  }

  // http://docs.couchdb.org/en/latest/api/server/common.html#post--_replicate
  function replicateDb(source, target, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    opts.source = _serializeAsUrl(source);
    opts.target = _serializeAsUrl(target);

    return relax({db: '_replicate', body: opts, method: 'POST'}, callback);
  }

  function docScope(dbName) {
    var docScope = {};

    // http://docs.couchdb.org/en/latest/api/document/common.html#put--db-docid
    // http://docs.couchdb.org/en/latest/api/database/common.html#post--db
    function insertDoc(doc, qs, callback) {
      var opts = {db: dbName, body: doc, method: 'POST'};

      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      if (typeof qs === 'string') {
        qs = {docName: qs};
      }

      if (qs) {
        if (qs.docName) {
          opts.doc = qs.docName;
          opts.method = 'PUT';
          delete qs.docName;
        }
        opts.qs = qs;
      }

      return relax(opts, callback);
    }

    // http://docs.couchdb.org/en/latest/api/document/common.html#delete--db-docid
    function destroyDoc(docName, rev, callback) {
      return relax({
        db: dbName,
        doc: docName,
        method: 'DELETE',
        qs: {rev: rev}
      }, callback);
    }

    // http://docs.couchdb.org/en/latest/api/document/common.html#get--db-docid
    function getDoc(docName, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      return relax({db: dbName, doc: docName, qs: qs}, callback);
    }

    // http://docs.couchdb.org/en/latest/api/document/common.html#head--db-docid
    function headDoc(docName, callback) {
      return relax({
        db: dbName,
        doc: docName,
        method: 'HEAD',
        qs: {}
      }, callback);
    }

    // http://docs.couchdb.org/en/latest/api/document/common.html#copy--db-docid
    function copyDoc(docSrc, docDest, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }

      var qs = {
        db: dbName,
        doc: docSrc,
        method: 'COPY',
        headers: {'Destination': docDest}
      };

      if (opts.overwrite) {
        return headDoc(docDest, function(e, b, h) {
          if (e && e.statusCode !== 404) {
            return callback(e);
          }
          if (h && typeof h.etag === 'string') {
            qs.headers.Destination += '?rev=' +
              h.etag.substring(1, h.etag.length - 1);
          }
          return relax(qs, callback);
        });
      } else {
        return relax(qs, callback);
      }
    }

    // http://docs.couchdb.org/en/latest/api/database/bulk-api.html#get--db-_all_docs
    function listDoc(qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      return relax({db: dbName, path: '_all_docs', qs: qs}, callback);
    }

    // http://docs.couchdb.org/en/latest/api/database/bulk-api.html#post--db-_all_docs
    function fetchDocs(docNames, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      qs['include_docs'] = true;

      return relax({
        db: dbName,
        path: '_all_docs',
        method: 'POST',
        qs: qs,
        body: docNames
      }, callback);
    }

    function fetchRevs(docNames, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }
      return relax({
        db: dbName,
        path: '_all_docs',
        method: 'POST',
        qs: qs,
        body: docNames
      }, callback);
    }

    // http://docs.couchdb.org/en/latest/api/ddoc/views.html#post--db-_design-ddoc-_view-view
    function viewDocs(ddoc, viewName, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      var viewPath = '_design/' + ddoc + '/_view/'  + viewName;

      if (qs && qs.keys) {
        var body = {keys: qs.keys};
        delete qs.keys;
        return relax({
          db: dbName,
          path: viewPath,
          method: 'POST',
          qs: qs,
          body: body
        }, callback);
      }
      else {
        return relax({db: dbName, path: viewPath, qs: qs}, callback);
      }
    }

    // geocouch
    function viewSpatial(ddoc, viewName, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      var viewPath = '_design/' + ddoc + '/_spatial/'  + viewName;

      return relax({db: dbName, path: viewPath, qs: qs}, callback);
    }

    // cloudant
    function viewSearch(ddoc, searchName, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      var viewPath = '_design/' + ddoc + '/_search/' + searchName;

      return relax({db: dbName, path: viewPath, qs: qs}, callback);
    }

    // http://docs.couchdb.org/en/latest/api/ddoc/render.html#get--db-_design-ddoc-_show-func
    function showDoc(ddoc, fn, docId, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      var show = '_design/' + ddoc + '/_show/'  + fn + '/' + docId;

      return relax({db: dbName, path: show, qs: qs}, callback);
    }

    // http://docs.couchdb.org/en/latest/api/ddoc/render.html#put--db-_design-ddoc-_update-func-docid
    function updateWithHandler(ddoc, updateName, docName, body, callback) {
      if (typeof body === 'function') {
        callback = body;
        body = {};
      }

      var updatePath = '_design/' + ddoc + '/_update/' + updateName +
        '/' + encodeURIComponent(docName);

      return relax({
       db: dbName,
       path: updatePath,
       method: 'PUT',
       body: body
      }, callback);
    }

    // http://docs.couchdb.org/en/latest/api/database/bulk-api.html#post--db-_bulksDoc
    function bulksDoc(docs, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      return relax({
        db: dbName,
        path: '_bulk_docs',
        body: docs,
        method: 'POST',
        qs: qs
      }, callback);
    }

    // http://docs.couchdb.org/en/latest/api/document/common.html#creating-multiple-attachments
    function insertMultipart(doc, attachments, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      if (typeof qs === 'string') {
        qs = {docName: qs};
      }

      var docName = qs.docName;
      delete qs.docName;

      doc = _.extend({_attachments: {}}, doc);

      var multipart = [];

      attachments.forEach(function(att) {
        doc._attachments[att.name] = {
          follows: true,
          length: Buffer.byteLength(att.data),
          contentType: att.contentType
        };
        multipart.push({body: att.data});
      });

      multipart.unshift({
        'content-type': 'application/json',
        body: JSON.stringify(doc)
      });

      return relax({
        db: dbName,
        method: 'PUT',
        contentType: 'multipart/related',
        doc: docName,
        qs: qs,
        multipart: multipart
      }, callback);
    }

    function getMultipart(docName, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      qs.attachments = true;

      return relax({
        db: dbName,
        doc: docName,
        encoding: null,
        contentType: 'multipart/related',
        qs: qs
      }, callback);
    }

    function insertAtt(docName, attName, att, contentType, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      return relax({
        db: dbName,
        att: attName,
        method: 'PUT',
        contentType: contentType,
        doc: docName,
        qs: qs,
        body: att,
        dontStringify: true
      }, callback);
    }

    function getAtt(docName, attName, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      return relax({
        db: dbName,
        att: attName,
        doc: docName,
        qs: qs,
        encoding: null,
        dontParse: true
      }, callback);
    }

    function destroyAtt(docName, attName, rev, callback) {
      return relax({
        db: dbName,
        att: attName,
        method: 'DELETE',
        doc: docName,
        qs: {rev: rev}
      }, callback);
    }

    function viewWithList(ddoc, viewName, listName, qs, callback) {
      if (typeof qs === 'function') {
        callback = qs;
        qs = {};
      }

      var listPath = '_design/' + ddoc + '/_list/' +
        listName + '/' + viewName;

      if (qs && qs.keys) {
        var body = {keys: qs.keys};
        delete qs.keys;
        return relax({
          db: dbName,
          path: listPath,
          method: 'POST',
          qs: qs,
          body: body
        }, callback);
      }
      else {
        return relax({
          db: dbName,
          path: listPath,
          qs: qs
        }, callback);
      }
    }

    // db level exports
    docScope = {
      info: function(cb) {
        return getDb(dbName, cb);
      },
      replicate: function(target, opts, cb) {
        return replicateDb(dbName, target, opts, cb);
      },
      compact: function(cb) {
        return compactDb(dbName, cb);
      },
      changes: function(qs, cb) {
        return changesDb(dbName, qs, cb);
      },
      follow: function(qs, cb) {
        return followDb(dbName, qs, cb);
      },
      auth: auth,
      session: session,
      insert: insertDoc,
      get: getDoc,
      head: headDoc,
      copy: copyDoc,
      destroy: destroyDoc,
      bulk: bulksDoc,
      list: listDoc,
      fetch: fetchDocs,
      fetchRevs: fetchRevs,
      config: {url: cfg.url, db: dbName},
      multipart: {
        insert: insertMultipart,
        get: getMultipart
      },
      attachment: {
        insert: insertAtt,
        get: getAtt,
        destroy: destroyAtt
      },
      show: showDoc,
      atomic: updateWithHandler,
      updateWithHandler: updateWithHandler,
      search: viewSearch,
      spatial: viewSpatial,
      view: viewDocs,
      viewWithList: viewWithList
    };

    docScope.view.compact = function(ddoc, cb) {
      return compactDb(dbName, ddoc, cb);
    };

    return docScope;
  }

  // server level exports
  serverScope = _.extend(serverScope, {
    db: {
      create: createDb,
      get: getDb,
      destroy: destroyDb,
      list: listDbs,
      use: docScope,
      scope: docScope,
      compact: compactDb,
      replicate: replicateDb,
      changes: changesDb,
      follow: followDb
    },
    use: docScope,
    scope: docScope,
    request: relax,
    relax: relax,
    dinosaur: relax,
    auth: auth,
    session: session,
    updates: updates,
    followUpdates: followUpdates
  });

  var path = u.parse(cfg.url);
  var pathArray = path.pathname.split('/').filter(function(e) { return e; });

  if (path.pathname && pathArray.length > 0) {

    auth = path.auth ? path.auth : '';
    var port = path.port ? ':' + path.port : '';
    var db = cfg.db ? cfg.db : decodeURIComponent(pathArray[0]);

    var format = {
      protocol: path.protocol,
      host: path.hostname + port
    };

    if (auth) {
      format.auth = auth;
    }

    if (cfg.db) {
      format.pathname = path.pathname + '/';
    }

    cfg.url = u.format(format);

    return docScope(db);
  }
  else {
    return serverScope;
  }

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
 */
nano.version = require('../package').version;
nano.path    = __dirname;
