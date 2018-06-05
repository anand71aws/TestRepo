'use strict';

const common = require('../../common');

const table = 'workflows';

function create(rows, uuid) {
  rows.forEach(row => row.workflow_id = uuid);
  const columns = [
    'workflow_id',
    'workflow_name',
    'application_instance_id',
    'app_name',
    'api_name',
  ];
  return common.create(table, columns, rows);
}

function read(select, column, value) {
  return common.read(select, table, column, value);
}

function update(rows, uuid) {
  return new Promise((resolve, reject) => {
    destroy(uuid)
      .then(() => create(rows, uuid))
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

function destroy(uuid) {
  const column = 'workflow_id';
  const value = uuid;
  return common.destroy(table, column, value);
}

exports.create = create;
exports.read = read;
exports.update = update;
exports.destroy = destroy;
