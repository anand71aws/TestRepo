'use strict';

const Joi = require('joi');
const handler = require('./workflow-handlers.js');

const routes = [];
const rowKeyValidation = {
  workflow_name: Joi.string().required(),
  application_instance_id: Joi.string().required(),
  app_name: Joi.string().required(),
  api_name: Joi.string().required(),
};
const userMappingRowKeyValidation = {
  workflow_name: Joi.string().required(),
  workflow_group_name: Joi.string().required(),
  user_email: Joi.string().required(),
  user_role: Joi.string().required(),
};

exports.register = function (server, options, next) {
  routes.forEach(route => {
    server.route(route);
  });
  next();
};

exports.register.attributes = require('./package');

routes.push({
  method: 'POST',
  path: '/workflow',
  config: {
    description: 'Create a new Workflow given table rows data',
    notes: 'Test Notes',
    tags: ['api'],
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
    validate: {
      payload: {
        rows: Joi.array().required()
          .items(Joi.object().keys(rowKeyValidation)),
        user_mapping_rows: Joi.array().required()
          .items(Joi.object().keys(userMappingRowKeyValidation)),
      },
    },
  },
  handler: handler.postWorkflow,
});

routes.push({
  method: 'PUT',
  path: '/workflow',
  config: {
    description: 'Update an existing Workflow given workflow_id and table rows data',
    notes: 'Update an existing workflow',
    tags: ['api'],
    cors: {
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-language'],
    },
    validate: {
      payload: {
        rows: Joi.array().required()
          .items(Joi.object().keys(rowKeyValidation)),
        user_mapping_rows: Joi.array().required()
          .items(Joi.object().keys(userMappingRowKeyValidation)),
        workflow_id: Joi.string().required(),
      },
    },
  },
  handler: handler.putWorkflow,
});

routes.push({
  method: 'DELETE',
  path: '/workflow',
  config: {
    description: 'Delete Workflow by workflow_id',
    notes: 'Delete workflow by workflow_id',
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
  handler: handler.deleteWorkflow,
});
