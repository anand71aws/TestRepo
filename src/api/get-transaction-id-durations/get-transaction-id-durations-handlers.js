'use strict';
const common = require('../../lib/common');

function getGetTransactionIdDurations(request, reply) {
  const transactionId = decodeURIComponent(request.query.transaction_id);
  const selectColumns = 'api_name, duration, app_name';
  const apiData = [];
  const apiNames = [];
  common.read(selectColumns, 'transactions_data_by_transaction_id', 'transaction_id', transactionId)
    .then(results => {
      results.rows.forEach(row => {
        const apiDetails = {};
        apiDetails[row.api_name] = row.duration;
        apiData.push(apiDetails);
        apiNames.push(row.api_name);
      });
      reply({
        apiNames,
        apiData,
      });
    })
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

exports.getGetTransactionIdDurations = getGetTransactionIdDurations;
