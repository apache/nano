/*
 * Generic Error
 *
 * e.g. 
 * { "stack": "Error: Document update conflict. at gen_err(error.js:14:43)",
 *   "message": "Document update conflict.",
 *   "error": "conflict",
 *   "http_code": 409,
 *   "namespace": "couch",
 *   "request": {
 *       "method": "PUT",
 *       "headers": {
 *           "content-type": "application/json",
 *           "accept": "application/json",
 *           "authorization": "BasicYWRtaW46YWRtaW4=",
 *           "content-length": 13
 *       },
 *       "body": {"foo": "baz"},
 *       "uri": "http://admin:admin@localhost: 5984/doc_up1/foo",
 *       "callback": [Function]
 *   }
 * }
 * 
 * Extension on Error to support more complex logic.
 * 
 * @param {error} Either an Error, or a string that will be casted into new
 *        error.
 * @param {code} The recognizable error code
 * @param {http_code} The HTTP code from CouchDB
 *
 * @return An error augmented an driver specific code
 */
function gen_err(error,code,request,http_code,type) {
  if(typeof error === 'string') { error = new Error(error); }
  if(!type) {
    type      = http_code;
    http_code = 500;
  }
  error.error      = code;
  error.http_code  = http_code;
  error.namespace  = type;
  error.request    = request;
  return error;
}

exports.request_err = function (e,c,r,h) { return gen_err(e,c,r,h,"request"); }; 
exports.couch_err   = function (e,c,r,h) { return gen_err(e,c,r,h,"couch");   }; 
