'use strict' ;
const common = require('../../lib/common');
const workflowsTable = require('../../lib/objects/workflow/workflow');
const workflowUserMapping = require('../../lib/objects/workflow/workflow-user-mapping');
const Client = require('../db-utility.js');

function getGetMyWorkflows(request, reply) {
  const promises = [];
  const selectColumns = 'workflow_group_name, workflow_id, user_role';
  const whereColumn = 'user_email';
  const whereValue = request.query.user_email;
  workflowUserMapping.read(selectColumns, whereColumn, whereValue)
    .then(result => {
      result.rows.forEach(workflow => {
        promises.push(getAPIsForWorkflow(workflow));
      });
      Promise.all(promises)
        .then(workflowGroups => combineWorkflowGroups(workflowGroups))
        .then(combinedResult => reply(combinedResult));
    })
    .catch(err => common.serverError(reply, err.error, err.errorString));
}

function getAPIsForWorkflow(workflow) {
  return new Promise((resolve, reject) => {
    const workflowGroup = {};
    const appList = [];
    const addedApps = {};
    let appIndex = 0;
    const select = 'app_name, application_instance_id, api_name, workflow_name';
    const whereColumn = 'workflow_id';
    const whereValue = workflow.workflow_id;
    workflowsTable.read(select, whereColumn, whereValue)
      .then(result => {
        let iCount = 0;
        const noOfRecordsForUser = result.rows.length;
        result.rows.forEach(row => {
          const apiQuery =
              `SELECT application_consumer_id
              FROM application_consumer_mapping where application_instance_id = ? and api_name = ? allow filtering`;

          const apiQueryParams = [
            row.application_instance_id,
            row.api_name,
          ];
          const queryOptions = {
            prepare: true,
          };

          Client.getDBConnection((err, data) => {
            const consumerIdArray = [];
            data.execute(apiQuery, apiQueryParams, queryOptions, (err, results) => {
              if (err) {
                console.error(`Error in workflows  : ${err}`);
              }

              const consmerMapRows = results.rows;

              consmerMapRows.forEach(row => {
                consumerIdArray.push(row.application_consumer_id);
              });

              if (addedApps[row.app_name] === undefined) {
                addedApps[row.app_name] = appIndex;
                appIndex += 1;
                appList.push({
                  app_name: row.app_name,
                  application_instance_id: row.application_instance_id,
                  api_group_list: [{
                    api_name: row.api_name,
                    application_consumer_ids: consumerIdArray,
                  }],
                });
              } else {
                appList[addedApps[row.app_name]].api_group_list.push({
                  api_name: row.api_name,
                  application_consumer_ids: consumerIdArray,
                });
              }

              workflowGroup.workflow_group_name = workflow.workflow_group_name;
              workflowGroup.workflows = [{
                workflow_id: workflow.workflow_id,
                workflow_name: result.rows[0].workflow_name,
                user_role: workflow.user_role,
                apps: appList,
              }];

              iCount = iCount + 1;
              if (iCount === noOfRecordsForUser) {
                resolve(workflowGroup);
              }
            });
          });
        });
      })
      .catch(error => reject({ error, errorString: 'Unable to get APIs for workflow' }));
  });
}
function combineWorkflowGroups(workflowGroups) {
  return new Promise(resolve => {
    const addedWorkflowGroups = {};
    let workflowGroupIndex = 0;
    const condensedResult = [];
    workflowGroups.forEach(workflowGroup => {
      const workflowGroupName = workflowGroup.workflow_group_name;
      if (addedWorkflowGroups[workflowGroupName] === undefined) {
        addedWorkflowGroups[workflowGroupName] = workflowGroupIndex;
        workflowGroupIndex += 1;
        condensedResult.push(workflowGroup);
      } else {
        const existingWorkflowGroup = condensedResult[addedWorkflowGroups[workflowGroupName]];
        existingWorkflowGroup.workflows.push(...workflowGroup.workflows);
      }
    });
    resolve(condensedResult);
  });
}
exports.getGetMyWorkflows = getGetMyWorkflows;
