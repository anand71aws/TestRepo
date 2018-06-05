'use strict';

const Joi = require('joi');
const handler = require('./subscribers-of-apps-handlers.js');
const routes = [];

exports.register = function(server, options, next) {
  routes.forEach(route => server.route(route));
  next();
};

exports.register.attributes = require('./package');

routes.push({
  method: 'GET',
  path: '/subscribers-of-apps',
  config: {
    description: 'Get subscribers of apps',
    notes: 'Get subscribers of apps',
    tags: ['api'],
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
    validate: {
      query: {
        apps: Joi.alternatives().try(Joi.string(), Joi.array()),
      },
    },
  },
  handler: handler.getSubscribersOfApps,
});
