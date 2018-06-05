'use strict';
const Joi = require('joi');
const Handlers = require('./get-workflow-chart-data-handlers.js');
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
  path: '/get-workflow-chart-data',
  config: {
    description: 'This API retrieves data from transactions_data table for each api in the workflow.',
    notes: 'This API retrieves data from transactions_data table for each api in the workflow.',
    tags: ['api'],
    validate: {
      query: Joi.object({
        workflow_id: Joi.string().required(),
        end_time: Joi.date()
          .required()
          .min(Joi.ref('start_time')),
        start_time: Joi.date().required(),
        user_email: Joi.string().required(),
      }),
      options: {
        abortEarly: false,
      },
    },
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
  },
  handler: Handlers.getGetWorkflowChartData,
});
