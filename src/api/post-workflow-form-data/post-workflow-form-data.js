'use strict';

const Joi = require('joi');
const Handlers = require('./post-workflow-form-data-handlers.js');
const routes = [];

exports.register = function (server, options, next) {
  routes.forEach(route => {
    server.route(route);
  });
  next();
};

exports.register.attributes = require('./package');

routes.push({
  method: 'POST',
  path: '/post-workflow-form-data',
  config: {
    description: 'Posts workflow form data to create workflows',
    notes: 'Test Notes',
    tags: ['api'],
    plugins: { payloadType: 'form' },
    validate: {
      payload: Joi.object().keys({
        rows: Joi.array().items(Joi.object().keys({
          workflow_name: Joi.string().required(),
          workflow_group_name: Joi.string().required(),
          application_instance_id: Joi.string().required(),
          app_name: Joi.string().required(),
          api_name: Joi.string().required(),
          application_consumer_id: Joi.string().allow(''),
          user_action: Joi.string().required(),
          user_email: Joi.string().required(),
        })),
      }),
    },
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
  },
  handler: Handlers.postPostWorkflowFormData,
});
