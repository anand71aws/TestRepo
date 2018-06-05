'use strict';

const Joi = require('joi');
const Handlers = require('./workflow-user-mapping-handlers');
const routes = [];

exports.register = function(server, options, next) {
  routes.forEach(route => {
    server.route(route);
  });
  next();
};

exports.register.attributes = require('./package');

routes.push({
  method: 'GET',
  path: '/workflow-user-mapping',
  config: {
    description: 'GET mappings for workflow-user-mapping by workflow_id',
    notes: 'Test Notes',
    tags: ['api'],
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
    validate: {
      query: {
        workflow_id: Joi.string().required(),
      },
    },
  },
  handler: Handlers.getWorkflowUserMapping,
});

routes.push({
  method: 'PUT',
  path: '/workflow-user-mapping',
  config: {
    description: 'Update single row for workflow-user-mapping',
    notes: 'Test Notes',
    tags: ['api'],
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
    validate: {
      payload: {
        user_mapping_row: Joi.object().keys({
          workflow_id: Joi.string().required(),
          workflow_name: Joi.string().required(),
          workflow_group_name: Joi.string().required(),
          user_email: Joi.string().required(),
          user_role: Joi.string().required(),
        }),
      },
    },
  },
  handler: Handlers.putWorkflowUserMapping,
});

routes.push({
  method: 'DELETE',
  path: '/workflow-user-mapping',
  config: {
    description: 'DELETE by id and user_email workflow-user-mapping',
    notes: 'Test Notes',
    tags: ['api'],
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
    validate: {
      query: {
        workflow_id: Joi.string().required(),
        user_email: Joi.string().required(),
      },
    },
  },
  handler: Handlers.deleteWorkflowUserMapping,
});
