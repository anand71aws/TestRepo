'use strict';

const dbClient = require('./db-utility.js');
const moment = require('moment');
const chalk = require('chalk');
let reqCounter = 0;

function buildTimeRange(startTime, endTime, segments = 30) {
  const step = (moment(endTime).toDate() - moment(startTime).toDate()) / segments;

  return Array.from({ length: segments }, (v, i) => ({
    startTime: moment(startTime).add(i * step),
    endTime: moment(startTime).add((i + 1) * step)
      .subtract(i + 1 === segments ? 0 : 1, 'ms'),
    index: i,
  }));
}
function getTxnDates(startDate, endDate) {
  const dates = [];
  const fromDate = moment(new Date(startDate));
  const toDate = moment(new Date(endDate));
  const currDate = fromDate.startOf('day');
  const lastDate = toDate.startOf('day');

  while (currDate.diff(lastDate) <= 0) {
    dates.push(currDate.format('YYYY-MM-DD'));
    currDate.add(1, 'days');
  }
  return dates.join(', ');
}

function getTransactionsData(appName, apiName, applicationInstanceId, applicationConsumerId,
  userAction, startTime, endTime) {
  return new Promise(resolve => {
    const loggingStartTime = moment(); // for logging purposes
    reqCounter += 1; // global request count
    const reqNumber = reqCounter;
    console.log(chalk.green(`[get-t-data] [${reqNumber}] [Start]`), moment());
    console.time(`queryTime [${reqNumber}]`);

    const cqlQueryParams = [
      appName,
      apiName,
      applicationInstanceId,
      '',
      startTime,
      endTime,
    ];
    let cqlQuery;
    if (userAction === 'creator') {
      cqlQuery =
      `SELECT sum(txn_count) as sumtrxcount, sum(duration_sum) as sumduration
      FROM transactions_data_aggregated_api
      WHERE app_name = ? AND api_name = ? AND application_instance_id = ?
      AND txn_date IN (?) AND start_time >= ?
      AND start_time <= ? AND responsestatus = 'Pass'`;
    } else if (userAction === 'subscriber') {
      cqlQuery =
        `SELECT sum(txn_count) as sumtrxcount, sum(duration_sum) as sumduration
        FROM transactions_data_aggregated_consumer
        WHERE app_name = ? AND api_name = ? AND application_instance_id = ?
        AND txn_date IN (?) AND start_time >= ?
        AND start_time <= ? AND responsestatus = 'Pass'
        AND application_consumer_id = ?`;
      cqlQueryParams.push(applicationConsumerId);
    }

    const queryOptions = {
      prepare: true,
    };

    const timeSegments = 30;
    const results = new Array(timeSegments); // this will store the final data to client

    const onComplete = function () {
      const timeElapsed = moment().diff(loggingStartTime, 'ms');
      if (timeElapsed > 1000)
        console.log(chalk.green(`[get-t-data] [${reqNumber}] [End]`), `${chalk.red(timeElapsed)} ms`);
      return resolve(results);
    };

    const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
    const timeRange = buildTimeRange(startTime, endTime, timeSegments);
    let tasksToGo = timeRange.length;
    if (tasksToGo === 0) {
      onComplete();
    } else {
      dbClient.getDBConnection((err, data) => {
        timeRange.forEach(range => {
          const dataResultSet = [];
          const qryParam = [...cqlQueryParams];
          qryParam[4] = range.startTime.format(dateFormat);
          qryParam[5] = range.endTime.format(dateFormat);
          qryParam[3] = getTxnDates(qryParam[4], qryParam[5]);

          data.stream(cqlQuery, qryParam, queryOptions)
            .on('readable', function () {
              let row;
              while ((row = this.read())) {
                dataResultSet.push(row);
              }
            })
            .on('end', () => {
              const transactions = parseInt(dataResultSet[0].sumtrxcount);
              const averageDuration = transactions > 0 ?
                (dataResultSet[0].sumduration / transactions) : 0;

              results[range.index] =
              {
                duration: Math.round(averageDuration),
                start_time: qryParam[4],
                end_time: qryParam[5],
                transactions: parseInt(transactions),
              };
              if ((tasksToGo -= 1) === 0) { // No tasks left, we are done with all tasks
                onComplete();
              }
            })
            .on('error', err => {
              console.log(chalk.red(`[get-t-data] [${reqNumber}] [Error]`), 'Error in chart-utility.js:', err);
              if ((tasksToGo -= 1) === 0) { // No tasks left, we are done with all tasks
                onComplete();
              }
            }
            );
        });
      });
    }
  });
}
exports.getTransactionsData = getTransactionsData;
