'use strict';

const Handlers = require('./get-transaction-id-chart-data-detail-handlers.js');
const routes = [];

exports.register = function (server, options, next) {
  routes.forEach(route => {
    server.route(route);
  });
  next();
};

exports.register.attributes = require('./package');

routes.push({
  method: 'GET',
  path: '/get-transaction-id-chart-data-detail',
  config: {
    description: 'Gets chart data drilldown data by transaction_id',
    notes: 'Test Notes',
    tags: ['api'],
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
  },
  handler: Handlers.getGetTransactionIdChartDataDetail,
});
