'use strict' ;

const moment = require('moment');
const common = require('../../lib/common');
const dbUtility = require('../db-utility.js');
const Uuid = require('dse-driver').types.Uuid;

// https://localhost:8443/get-workflow-chart-data-detail?workflow_id=1541e530-762f-11e7-bdf3-675e8fe677d5&start_time=2017-08-06%2000:28:55:000&end_time=2017-08-07%2000:28:55:000&user_email=kevin.joh.o-brien@hpe.com

function getGetWorkflowChartDataDetail (request, reply) {
  const promises = [];
  const resultLimit = 15000;
  const userEmail = decodeURIComponent(request.query.user_email);
  const startTime = request.query.start_time;
  const endTime = request.query.end_time;
  const workflowUuid = Uuid.fromString(decodeURIComponent(request.query.workflow_id));
  common.read('*', 'workflows', 'workflow_id', workflowUuid)
    .then(apis => {
      apis.rows.forEach(api => {
        promises.push(getUserApplicationMapping(api, userEmail));
      });
      Promise.all(promises)
        .then(apisWithConsumerMapping => {
          const promises = [];
          const limitPerAPI = Math.round(resultLimit / apis.rows.length);
          apisWithConsumerMapping.forEach(api => {
            promises.push(getDataDetailForAPIs(api, startTime, endTime, limitPerAPI));
          });
          Promise.all(promises)
            .then(result => {
              const flattenedResult = result.reduce((a, b) => a.concat(b));
              const sortedResult = common.sortArrayOfObjectsByDateKey(flattenedResult, 'start_time', 'DESC');
              reply(sortedResult);
            });
        });
    })
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

function getUserApplicationMapping(api, userEmail) {
  return new Promise((resolve, reject) => {
    const select = 'user_action, application_consumer_id';
    const table = 'user_application_mapping';
    const whereColumn = 'user_email';
    common.read(select, table, whereColumn, userEmail)
      .then(appMapping => {
        api.user_action = appMapping.rows[0].user_action;
        api.application_consumer_id = appMapping.rows[0].application_consumer_id;
        resolve(api);
      })
      .catch(err => reject(err));
  });
}

function getDataDetailForAPIs(api, startTime, endTime, limitPerAPI) {
  const currentDate = endTime.substring(0, 10);
  const previousDate = startTime.substring(0, 10);
  const transDate = [];
  for (let m = moment(currentDate); m.diff(previousDate, 'days') >= 0; m.subtract(1, 'days')) {
    transDate.push(m.format('YYYY-MM-DD'));
  }
  const queryParams = [
    api.app_name,
    api.api_name,
    api.application_instance_id,
    transDate,
    startTime,
    endTime,
  ];
  let queryTable = 'transactions_data';
  let subscriberFilter = '';
  const queryOptions = {
    prepare: true,
  };
  if (api.user_action === 'subscriber') {
    subscriberFilter = 'AND application_consumer_id = ?';
    queryParams.push(api.application_consumer_id);
    queryTable = 'transactions_data_by_consumer';
  }
  const query = `SELECT * FROM ${queryTable}
    WHERE app_name = ? AND api_name = ? AND application_instance_id = ?
    AND txn_date in ?
    AND start_time >= ?
    AND start_time <= ?
    ${subscriberFilter}
    limit ${limitPerAPI}`;
  return new Promise((resolve, reject) => {
    dbUtility.getDBConnection((error, db) => {
      if (error) return reject({ error, errorString: 'Unable to get database connection' });
      db.execute(query, queryParams, queryOptions, (error, result) => {
        if (error) return reject({ error, errorString: `Error executing query ${query}` });
        resolve(result.rows);
      });
    });
  });
}


exports.getGetWorkflowChartDataDetail = getGetWorkflowChartDataDetail;
