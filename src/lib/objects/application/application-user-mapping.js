'use strict';

const common = require('../../common');

function create(userMappings, uuid) {
  userMappings.forEach(userMapping => userMapping.id = uuid);
  const table = 'user_application_mapping';
  const columns = [
    'id',
    'user_email',
    'user_action',
    'app_name',
    'application_consumer_id',
    'application_instance_id',
    'eprid',
    'organization_name',
  ];
  return common.create(table, columns, userMappings);
}

function read(select, column, value) {
  const table = 'user_application_mapping_mapping_by_app_name';
  return common.read(select, table, column, value);
}

function readByValues(select, column, values) {
  const table = column === 'app_name' ?
    'user_application_mapping_mapping_by_app_name' :
    'user_application_mapping';
  return common.readByValues(select, table, column, values);
}

function update(userMappings, uuid) {
  return new Promise((resolve, reject) => {
    destroy(uuid)
      .then(() => create(userMappings, uuid))
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

function destroy(column, value) {
  const table = 'user_application_mapping';
  return common.destroy(table, column, value);
}

exports.create = create;
exports.read = read;
exports.readByValues = readByValues;
exports.update = update;
exports.destroy = destroy;
