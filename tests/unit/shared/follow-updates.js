'use strict';

var followUpdates = require('../../helpers/unit').unit([
  'server',
  'followUpdates'
]);

followUpdates({db: '/_db_updates'});
followUpdates({since: 1}, {db: '/_db_updates', since: 1});
