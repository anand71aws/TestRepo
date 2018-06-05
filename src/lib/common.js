'use strict';

const dbUtility = require('../api/db-utility');

const database = 'entmon';
const queryOptions = { prepare: true };

// Local function. Operates on rows selected with columns and values.
function operateOnColumnsAndValues(operation, table, columns, values) {
  return new Promise((resolve, reject) => {
    dbUtility.getDBConnection((error, db) => {
      if (error) return reject({ error, errorString: 'Unable to get database connection' });

      const whereStatement = columns.map(column => `${column} = ?`).join(' AND ');
      const query = `
        ${operation}
          FROM ${database}.${table}
         WHERE ${whereStatement}`;
      const queryParams = values;

      db.execute(query, queryParams, queryOptions, (error, result) => {
        if (error) return reject({ error, errorString: `Unable to ${operation} from ${table}` });
        if (operation.includes('SELECT')) resolve({ rows: result.rows });
        else resolve();
      });
    });
  });
}

// Inserts rows into a table.
function create(table, columns, rows) {
  const columnsStatement = columns.join(', ');
  const valuesStatement = columns.map(() => '?').join(', ');
  const query = `
    INSERT INTO ${database}.${table}
      (${columnsStatement})
      VALUES (${valuesStatement})`;
  const promises = [];
  dbUtility.getDBConnection((error, db) => {
    rows.forEach(row => {
      promises.push(new Promise((resolve, reject) => {
        if (error) return reject({ error, errorString: 'Unable to get database connection' });
        const queryParams = columns.map(column => row[column]);
        db.execute(query, queryParams, queryOptions, error => {
          if (error) return reject({ error, errorString: `Unable to create ${table}` });
          resolve();
        });
      }));
    });
  });
  return Promise.all(promises);
}

// Resolves an array of rows selected.
function read(select, table, column, value) {
  return operateOnColumnsAndValues(`SELECT ${select}`, table, [column], [value]);
}

// Resolves an array of arrays of rows selected.
function readByValues(select, table, column, values) {
  const promises = values.map(value => read(select, table, column, value));
  return Promise.all(promises);
}

// Resolves an array of rows selected.
function readByColumnsAndValues(select, table, columns, values) {
  return operateOnColumnsAndValues(`SELECT ${select}`, table, columns, values);
}

// Destroys rows selected.
function destroy(table, column, value) {
  return operateOnColumnsAndValues('DELETE', table, [column], [value]);
}

// Destroys rows selected.
function destroyByColumnsAndValues(table, columns, values) {
  return operateOnColumnsAndValues('DELETE', table, columns, values);
}

function sortArrayOfObjectsByDateKey(array, key, order = 'DESC') {
  if (order.toUpperCase() === 'DESC') {
    array.sort((a, b) => new Date(b[key]).getTime() - new Date(a[key]).getTime());
  } else if (order.toUpperCase() === 'ASC') {
    array.sort((a, b) => new Date(a[key]).getTime() - new Date(b[key]).getTime());
  }
  return array;
}

function serverError(reply, err, errorString) {
  reply(errorString).code(500);
  console.error();
  console.error(errorString);
  console.error(err);
  console.error();
}

// DB Operations
exports.create = create;
exports.read = read;
exports.readByValues = readByValues;
exports.readByColumnsAndValues = readByColumnsAndValues;
exports.destroy = destroy;
exports.destroyByColumnsAndValues = destroyByColumnsAndValues;

// Utility
exports.serverError = serverError;
exports.sortArrayOfObjectsByDateKey = sortArrayOfObjectsByDateKey;

// Constants
exports.database = database;
exports.queryOptions = queryOptions;
