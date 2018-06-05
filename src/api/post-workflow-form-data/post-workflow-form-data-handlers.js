'use strict' ;
const client = require('../db-utility.js');
const TimeUuid = require('dse-driver').types.TimeUuid;

function postPostWorkflowFormData (request, reply) {
  const formData = request.payload;
  const cqlQuery = `
    insert into entmon.workflows
    (workflow_id, workflow_name, workflow_group_name, application_instance_id, app_name, api_name, application_consumer_id, user_action, user_email)
    values(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const queryOptions = { prepare: true };
  const uuid = TimeUuid.now();
  const promises = [];
  client.getDBConnection((error, data) => {
    if (error) return reply('Unable to get database connection').code(500);
    formData.rows.forEach(workflow => {
      const queryParams = [
        uuid,
        workflow.workflow_name,
        workflow.workflow_group_name,
        workflow.application_instance_id,
        workflow.app_name,
        workflow.api_name,
        workflow.application_consumer_id,
        workflow.user_action,
        workflow.user_email,
      ];
      promises.push(new Promise((resolve, reject) => {
        data.execute(cqlQuery, queryParams, queryOptions, error => {
          if (error) return reject({ error, errorString: 'Unable to create workflow' });
          resolve();
        });
      }));
    });
  });
  Promise.all(promises)
    .then(() => reply('Successfully added workflow.'))
    .catch(err => reply(err).code(500));
}

exports.postPostWorkflowFormData = postPostWorkflowFormData;
