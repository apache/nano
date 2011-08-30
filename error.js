var STATUS_CODES = { '100': 'Continue'
                   , '101': 'Switching Protocols'
                   , '102': 'Processing'
                   , '200': 'OK'
                   , '201': 'Created'
                   , '202': 'Accepted'
                   , '203': 'Non-Authoritative Information'
                   , '204': 'No Content'
                   , '205': 'Reset Content'
                   , '206': 'Partial Content'
                   , '207': 'Multi-Status'
                   , '300': 'Multiple Choices'
                   , '301': 'Moved Permanently'
                   , '302': 'Moved Temporarily'
                   , '303': 'See Other'
                   , '304': 'Not Modified'
                   , '305': 'Use Proxy'
                   , '307': 'Temporary Redirect'
                   , '400': 'Bad Request'
                   , '401': 'Unauthorized'
                   , '402': 'Payment Required'
                   , '403': 'Forbidden'
                   , '404': 'Not Found'
                   , '405': 'Method Not Allowed'
                   , '406': 'Not Acceptable'
                   , '407': 'Proxy Authentication Required'
                   , '408': 'Request Time-out'
                   , '409': 'Conflict'
                   , '410': 'Gone'
                   , '411': 'Length Required'
                   , '412': 'Precondition Failed'
                   , '413': 'Request Entity Too Large'
                   , '414': 'Request-URI Too Large'
                   , '415': 'Unsupported Media Type'
                   , '416': 'Requested Range Not Satisfiable'
                   , '417': 'Expectation Failed'
                   , '418': 'I\'m a teapot'
                   , '422': 'Unprocessable Entity'
                   , '423': 'Locked'
                   , '424': 'Failed Dependency'
                   , '425': 'Unordered Collection'
                   , '426': 'Upgrade Required'
                   , '500': 'Internal Server Error'
                   , '501': 'Not Implemented'
                   , '502': 'Bad Gateway'
                   , '503': 'Service Unavailable'
                   , '504': 'Gateway Time-out'
                   , '505': 'HTTP Version not supported'
                   , '506': 'Variant Also Negotiates'
                   , '507': 'Insufficient Storage'
                   , '509': 'Bandwidth Limit Exceeded'
                   , '510': 'Not Extended' 
                   };
/*
 * generic error
 *
 * e.g. missing rev information:
 *
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
 * extension on error to support more complex logic.
 * 
 * @param {error:error|string} the error or a reason for the error
 * @param {code:string} the recognizable error code
 * @param {http_code:integer:optional} the http code from couchdb
 * @param {request:object} the request that was made to couch
 * @param {type:string} a namespace for the error, e.g. couch 
 *
 * @return an augmented error that helps you know more than the stack trace
 */
function gen_err(scope,error,code,request,status_code) {
  error       = error             || STATUS_CODES[status_code] || 'Unknown Error';
  code        = code                                           || 'unknown';
  status_code = typeof status_code === 'number' && status_code || 500;
  request     = request                                        || {};
  if(typeof error === 'string') { error = new Error(error); }
  error.error        = code;
  error.status_code  = status_code;
  error.scope        = scope;
  error.request      = request;
  return error;
}

exports.request = function (e,c,r,s) { return gen_err('request',e,c,r,s);};
exports.couch   = function (e,c,r,s) { return gen_err('couch',e,c,r,s);  };