'use strict';
const Joi = require('joi');
const Handlers = require('./get-transaction-id-durations-handlers.js');
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
  path: '/get-transaction-id-durations',
  config: {
    description: 'This API  gets the durations of all apis that run with the given transaction_id',
    notes: 'This API gives apiNames with their duration for a given transaction_id',
    tags: ['api'],
    validate: {
      query: Joi.object({
        transaction_id: Joi.string().required(),
      }),
      options: {
        abortEarly: false,
      },
    },
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
  },
  handler: Handlers.getGetTransactionIdDurations,
});
