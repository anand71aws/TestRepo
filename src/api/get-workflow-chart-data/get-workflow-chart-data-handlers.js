'use strict' ;
const chartUtil = require('../chart-utility.js');
const Uuid = require('dse-driver').types.Uuid;
const common = require('../../lib/common');

function getGetWorkflowChartData (request, reply) {
  const userEmail = decodeURIComponent(request.query.user_email);
  const startTime = decodeURIComponent(request.query.start_time);
  const endTime = decodeURIComponent(request.query.end_time);
  const workflowUuid = Uuid.fromString(decodeURIComponent(request.query.workflow_id));
  common.read('*', 'workflows', 'workflow_id', workflowUuid)
    .then(result => getUserApplicationMappings(result.rows, userEmail))
    .then(apis => getChartData(apis, startTime, endTime))
    .then(data => reply({ apis: data }))
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

function getChartData(apiList, startTime, endTime) {
  return new Promise((resolve, reject) => {
    const apiData = [];
    apiList.forEach(api => {
      chartUtil.getTransactionsData(
        api.app_name,
        api.api_name,
        api.application_instance_id,
        api.application_consumer_id,
        api.user_action,
        startTime,
        endTime
      )
        .then(transactionDataResponse => {
          apiData.push({
            api_name: api.api_name,
            data: transactionDataResponse,
          });
          if (apiData.length === apiList.length) {
            return resolve(apiData);
          }
        })
        .catch(err => reject(err));
    });
  });
}

function getUserApplicationMappings(apis, userEmail) {
  const promisedQueries = [];
  apis.forEach(api => {
    promisedQueries.push(new Promise((resolve, reject) => {
      const selectedColumns = [
        'user_action',
        'application_consumer_id',
      ];
      const table = 'user_application_mapping';
      const whereColumn = 'user_email';
      common.read(selectedColumns, table, whereColumn, userEmail)
        .then(appMapping => {
          api.user_action = appMapping.rows[0].user_action;
          api.application_consumer_id = appMapping.rows[0].application_consumer_id;
          resolve(api);
        })
        .catch(err => reject(err));
    })
    );
  });
  return Promise.all(promisedQueries);
}

exports.getGetWorkflowChartData = getGetWorkflowChartData;
