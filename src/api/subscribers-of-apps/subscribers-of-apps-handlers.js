'use strict';

const _ = require('lodash');

const applicationUserMapping = require('../../lib/objects/application/application-user-mapping');
const common = require('../../lib/common');

function getSubscribersOfApps(request, reply) {
  const selectField = 'user_email';
  const column = 'app_name';
  const values = Array.isArray(request.query.apps) ?
    request.query.apps :
    [request.query.apps];
  applicationUserMapping.readByValues(selectField, column, values)
    .then(results => {
      const subscribersOfApps = results.map(result => result.rows.map(row => row.user_email));
      const emails = _.uniq([].concat(...subscribersOfApps));
      reply(emails);
    })
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

exports.getSubscribersOfApps = getSubscribersOfApps;
