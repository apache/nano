/*
 * Generic Error
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
function gen_err(reason,code,request,http_code,type) {
  if(typeof reason === 'string') { error = new Error(reason); }
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
