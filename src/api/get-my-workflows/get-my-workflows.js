'use strict';
const Joi = require('joi');
const Handlers = require('./get-my-workflows-handlers.js');
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
  path: '/get-my-workflows',
  config: {
    description: 'This API gets all workflows for a given user',
    notes: 'This API gets all workflows for a given user',
    tags: ['api'],
    validate: {
      query: Joi.object({
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
  handler: Handlers.getGetMyWorkflows,
});
