'use strict';

const Client = require('../db-utility.js');

function getGetTransactionIdChartDataDetail(request, reply) {
  const cqlQuery = 'select * from  transactions_data_by_transaction_id where transaction_id = ? limit 1000 ';

  const cqlQueryParams = [
    request.query.transaction_id,
  ];

  const queryOptions = {
    prepare: true,
  };

  Client.getDBConnection((err, data) => {
    data.execute(cqlQuery, cqlQueryParams, queryOptions, (err, result) => {
      if (err) {
        console.log(`Error in transactionId-chart-data-transaction details : ${err}`);
        reply('');
      } else {
        reply(result.rows);
      }
    });
  });
}

exports.getGetTransactionIdChartDataDetail = getGetTransactionIdChartDataDetail;
