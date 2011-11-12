module.exports = 
  { db_name : function (prefix) {
      return function db_name(i) { 
        return process.version.replace(/\./g,'') + '_' +prefix + i; };
    }
  };