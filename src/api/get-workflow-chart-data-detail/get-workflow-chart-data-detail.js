'use strict';

const Handlers = require('./get-workflow-chart-data-detail-handlers.js');
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
  path: '/get-workflow-chart-data-detail',
  config: {
    description: 'Retrieves chart data detail for workflows.',
    notes: 'Test Notes',
    tags: ['api'],
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
  },
  handler: Handlers.getGetWorkflowChartDataDetail,
});
