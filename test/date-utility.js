'use strict';

const dateUtility = require('../src/lib/date-utility');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const experiment = lab.experiment;
const test = lab.test;
const expect = Code.expect;

experiment('date-utility: buildTimeRange()', () => {
  const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
  const startTime = '2017-08-01 00:00:00';
  const endTime = '2017-08-01 00:30:00';

  test('Returns number of elements provided in segments parameter', done => {
    const expectedSegments = 10;

    const timeRange = dateUtility.buildTimeRange(startTime, endTime, expectedSegments);

    expect(timeRange.length).to.equal(expectedSegments);
    done();
  });

  test('Returns 30 elements when segments parameter is omitted', done => {
    const timeRange = dateUtility.buildTimeRange(startTime, endTime);

    expect(timeRange.length).to.equal(30);
    done();
  });

  test('Start time of first element in time range equals startTime parameter', done => {
    const timeRange = dateUtility.buildTimeRange(startTime, endTime);
    const firstSegment = timeRange[0];
    const firstSegmentStartTime = firstSegment.startTime.format(dateTimeFormat);

    expect(firstSegmentStartTime).to.equal(startTime);
    done();
  });

  test('End time of last element in time range equals endTime parameter', done => {
    const timeRange = dateUtility.buildTimeRange(startTime, endTime);
    const lastSegment = timeRange[timeRange.length - 1];
    const lastSegmentEndTime = lastSegment.endTime.format(dateTimeFormat);

    expect(lastSegmentEndTime).to.equal(endTime);
    done();
  });
});

experiment('date-utility: buildDateRange()', () => {
  test('Returns an array', done => {
    const dateRange = dateUtility.buildDateRange();

    expect(dateRange).to.be.an.array();
    done();
  });

  test('Same startDate and endDate results in one value in date range', done => {
    const startDate = '2017-08-04';
    const endDate = '2017-08-04';

    const dateRange = dateUtility.buildDateRange(startDate, endDate);

    expect(dateRange).to.have.length(1);
    done();
  });

  test('Generates an expected date range for a given startDate and endDate', done => {
    const startDate = '2017-08-01';
    const endDate = '2017-08-04';
    const expectedDateRange = [
      '2017-08-01',
      '2017-08-02',
      '2017-08-03',
      '2017-08-04',
    ];

    const dateRange = dateUtility.buildDateRange(startDate, endDate);

    expect(dateRange).to.contain(expectedDateRange);
    done();
  });
});
