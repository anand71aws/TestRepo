'use strict';

const workflowUserMapping = require('../../lib/objects/workflow/workflow-user-mapping');
const common = require('../../lib/common');

function getWorkflowUserMapping(request, reply) {
  const selectFields = 'user_email, user_role';
  const column = 'workflow_id';
  const value = request.query.workflow_id;
  workflowUserMapping.read(selectFields, column, value)
    .then(users => reply(users))
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

function putWorkflowUserMapping(request, reply) {
  const userMapping = request.payload.user_mapping_row;
  const workflowId = userMapping.workflow_id;
  const userEmail = userMapping.user_email;
  workflowUserMapping.updateSingle(userMapping, workflowId, userEmail)
    .then(() => reply())
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

function deleteWorkflowUserMapping(request, reply) {
  const email = decodeURIComponent(request.query.user_email);
  const uuid = decodeURIComponent(request.query.workflow_id);
  workflowUserMapping.destroySingle({
    workflow_id: uuid,
    user_email: email,
  })
    .then(() => reply())
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

exports.getWorkflowUserMapping = getWorkflowUserMapping;
exports.putWorkflowUserMapping = putWorkflowUserMapping;
exports.deleteWorkflowUserMapping = deleteWorkflowUserMapping;
