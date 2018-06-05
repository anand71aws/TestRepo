'use strict';

const common = require('../../common');

function create(userMappings, uuid) {
  userMappings.forEach(userMapping => userMapping.workflow_id = uuid);
  const table = 'user_workflow_mapping';
  const columns = [
    'workflow_id',
    'workflow_group_name',
    'user_email',
    'user_role',
  ];
  return common.create(table, columns, userMappings);
}

function read(select, column, value) {
  const table = column === 'workflow_id' ?
    'user_workflow_mapping_by_workflow_id' :
    'user_workflow_mapping';
  return common.read(select, table, column, value);
}

function readByColumnsAndValues(select, columns, values) {
  const table = 'user_workflow_mapping';
  return common.readByColumnsAndValues(select, table, columns, values);
}

function update(userMappings, uuid) {
  return new Promise((resolve, reject) => {
    destroy(uuid)
      .then(() => create(userMappings, uuid))
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

function updateSingle(userMapping, uuid, userEmail) {
  return new Promise((resolve, reject) => {
    destroySingle({
      workflow_id: uuid,
      user_email: userEmail,
    })
      .then(() => create([userMapping], uuid))
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

function destroy(uuid) {
  const selectFields = 'workflow_id, user_email';
  const table = 'user_workflow_mapping_by_workflow_id';
  const column = 'workflow_id';
  const value = uuid;
  return common.read(selectFields, table, column, value)
    .then(userMappings => userMappings.rows.map(userMapping => destroySingle(userMapping)))
    .then(promises => Promise.all(promises));
}

function destroySingle(userMapping) {
  const table = 'user_workflow_mapping';
  const columns = ['workflow_id', 'user_email'];
  const values = [userMapping.workflow_id, userMapping.user_email];
  return common.destroyByColumnsAndValues(table, columns, values);
}

exports.create = create;
exports.read = read;
exports.readByColumnsAndValues = readByColumnsAndValues;
exports.update = update;
exports.updateSingle = updateSingle;
exports.destroy = destroy;
exports.destroySingle = destroySingle;
