var nano=require('./nano.js')('http://localhost:5984');
var mycouchdb = nano.use('foo_db');

mycouchdb.newid(function(err, id_string){
  if(!err){console.log('mycouchdb.newid: '+id_string)}
  else {console.log('error: \n'+err)};
});
nano.newid(function(err, id_string){
  if(!err){console.log('nano.newid: '+id_string)}
  else {console.log('error: \n'+err)};
});






