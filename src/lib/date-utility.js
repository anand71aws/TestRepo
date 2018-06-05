'use strict';

const moment = require('moment');

const dateFormat = 'YYYY-MM-DD';

function buildTimeRange(startTime, endTime, segments = 30) {
  const step = (moment(endTime).toDate() - moment(startTime).toDate()) / segments;

  return Array.from({ length: segments }, (v, i) => ({
    startTime: moment(startTime).add(i * step),
    endTime: moment(startTime).add((i + 1) * step).
      subtract(i + 1 === segments ? 0 : 1, 'ms'),
    index: i,
  }));
}

function buildDateRange(start, end) {
  const endDate = moment.utc(end);
  const activeDate = moment.utc(start);
  const dateRange = [];

  while (endDate.diff(activeDate) >= 0) {
    dateRange.push(activeDate.format(dateFormat));
    activeDate.add(1, 'days');
  }

  return dateRange;
}

module.exports.buildTimeRange = buildTimeRange;
module.exports.buildDateRange = buildDateRange;
