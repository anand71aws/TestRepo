'use strict';

const workflow = require('../../lib/objects/workflow/workflow');
const workflowUserMapping = require('../../lib/objects/workflow/workflow-user-mapping');
const common = require('../../lib/common');
const TimeUuid = require('dse-driver').types.TimeUuid;

function postWorkflow(request, reply) {
  const uuid = TimeUuid.now();
  workflow.create(request.payload.rows, uuid)
    .then(() => workflowUserMapping.create(request.payload.user_mapping_rows, uuid))
    .then(() => reply())
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

function putWorkflow(request, reply) {
  const uuid = request.payload.workflow_id;
  workflow.update(request.payload.rows, uuid)
    .then(() => workflowUserMapping.update(request.payload.user_mapping_rows, uuid))
    .then(() => reply())
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

function deleteWorkflow(request, reply) {
  const uuid = request.query.workflow_id;
  workflow.destroy(uuid)
    .then(() => workflowUserMapping.destroy(uuid))
    .then(() => reply())
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

exports.postWorkflow = postWorkflow;
exports.putWorkflow = putWorkflow;
exports.deleteWorkflow = deleteWorkflow;
