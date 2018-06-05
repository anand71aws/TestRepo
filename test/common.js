const Code = require('code');
const Lab = require('lab');
const Hapi = require('hapi');
const addison = require('./lib/addison');
const sinon = require('sinon');

const lab = exports.lab = Lab.script();
const before = lab.before;
const after = lab.after;

let common = null;
let dbUtility = null;

lab.experiment('Common (DB Operations)', () => {
  const queryOptions = {
    prepare: true,
  };

  const testRunTime = Date.now();
  const applicationInstanceId = `testInstanceId_${testRunTime}`;

  const loadTestData = (length = 1, identifier = applicationInstanceId) => {
    const insertQuery = `
      INSERT
        INTO applications
             (application_instance_id, app_name, api_name)
      VALUES (?, ?, ?)`;

    const applications = Array.from({ length }, (v, index) => [
      identifier,
      `app_name_${index}`,
      `api_name_${index}`,
    ]);

    const queries = applications.map(application => ({
      query: insertQuery,
      params: application,
    }));

    return new Promise((resolve, reject) => {
      dbUtility.getDBConnection((error, client) => {
        if (error) return reject(error);
        client.batch(queries, queryOptions, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
    });
  };

  const removeTestData = (identifier = applicationInstanceId) => {
    const deleteQuery = `
      DELETE
        FROM applications
       WHERE application_instance_id = '${identifier}'`;

    return new Promise((resolve, reject) => {
      dbUtility.getDBConnection((error, client) => {
        if (error) return reject(error);
        client.execute(deleteQuery, queryOptions, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
    });
  };

  before(done => {
    addison.getServer()
      .then(() => dbUtility = dbUtility || require('../src/api/db-utility'))
      .then(() => common = common || require('../src/lib/common'))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('Calling read() with no database available should cause an exception', done => {
    const selectedColumns = '*';
    const table = 'applications';
    const filterColumn = 'application_instance_id';
    const filterValue = applicationInstanceId;

    const error = new Error('This is an Error object created as part of a test only');
    sinon.stub(dbUtility, 'getDBConnection').callsFake(callback => callback(error, null));

    common.read(selectedColumns, table, filterColumn, filterValue)
      .catch(error => {
        dbUtility.getDBConnection.restore();
        Code.expect(error).to.exist();
        done();
      });
  });

  lab.test('read() result should contain number of inserted records', done => {
    const recordsCount = 5;

    const selectedColumns = '*';
    const table = 'applications';
    const filterColumn = 'application_instance_id';
    const filterValue = applicationInstanceId;

    removeTestData()
      .then(() => loadTestData(recordsCount))
      .then(() => common.read(selectedColumns, table, filterColumn, filterValue))
      .then(result => Code.expect(result.rows).to.have.length(recordsCount))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('Calling read() with an invalid column should cause an exception', done => {
    const recordsCount = 5;

    const selectedColumns = '*';
    const table = 'applications';
    const filterColumn = 'invalid_column_name';
    const filterValue = applicationInstanceId;

    removeTestData()
      .then(() => loadTestData(recordsCount))
      .then(() => common.read(selectedColumns, table, filterColumn, filterValue))
      .catch(error => {
        Code.expect(error).to.exist();
        done();
      });
  });

  lab.test('readByValues() result should be an array', done => {
    const recordsCount = 5;

    const selectedColumns = '*';
    const table = 'applications';
    const filterColumn = 'application_instance_id';
    const filterValues = [applicationInstanceId];

    removeTestData()
      .then(() => loadTestData(recordsCount))
      .then(() => common.readByValues(selectedColumns, table, filterColumn, filterValues))
      .then(results => Code.expect(results).to.be.an.array())
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('readByValues() result elements should contain the number of inserted records', done => {
    const recordsCount = 5;

    const selectedColumns = '*';
    const table = 'applications';
    const filterColumn = 'application_instance_id';
    const filterValues = [applicationInstanceId];

    removeTestData()
      .then(() => loadTestData(recordsCount))
      .then(() => common.readByValues(selectedColumns, table, filterColumn, filterValues))
      .then(results => results.forEach(result => Code.expect(result.rows).length(recordsCount)))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('readByColumnsAndValues() results should be limited by the filter criteria', done => {
    const recordsCount = 5;

    const selected = '*';
    const table = 'applications';
    const filterColumns = [
      'application_instance_id',
      'app_name',
    ];
    const filterValues = [
      applicationInstanceId,
      'app_name_0',
    ];

    removeTestData()
      .then(() => loadTestData(recordsCount))
      .then(() => common.readByColumnsAndValues(selected, table, filterColumns, filterValues))
      .then(result => Code.expect(result.rows).to.have.a.length(1))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('destroy() should remove specified records', done => {
    const recordsCount = 5;

    const selectedColumns = '*';
    const table = 'applications';
    const filterColumn = 'application_instance_id';
    const filterValue = applicationInstanceId;

    removeTestData()
      .then(() => loadTestData(recordsCount))
      .then(() => common.read(selectedColumns, table, filterColumn, filterValue))
      .then(result => Code.expect(result.rows).to.have.length(recordsCount))
      .then(() => common.destroy(table, filterColumn, filterValue))
      .then(() => common.read(selectedColumns, table, filterColumn, filterValue))
      .then(result => Code.expect(result.rows).to.have.length(0))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('destroyByColumnsAndValues() should remove specified records', done => {
    const recordsCount = 5;

    const selected = '*';
    const table = 'applications';
    const filterColumns = ['application_instance_id'];
    const filterValues = [applicationInstanceId];

    removeTestData()
      .then(() => loadTestData(recordsCount))
      .then(() => common.readByColumnsAndValues(selected, table, filterColumns, filterValues))
      .then(result => Code.expect(result.rows).to.have.length(recordsCount))
      .then(() => common.destroyByColumnsAndValues(table, filterColumns, filterValues))
      .then(() => common.readByColumnsAndValues(selected, table, filterColumns, filterValues))
      .then(result => Code.expect(result.rows).to.have.length(0))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('Calling create() should insert rows in the database', done => {
    const recordsCount = 5;

    const selected = '*';
    const table = 'applications';
    const filterColumns = ['application_instance_id'];
    const filterValues = [applicationInstanceId];

    const insertColumnNames = [
      'application_instance_id',
      'app_name',
      'api_name',
    ];

    const insertColumnValues = Array.from({ length: recordsCount }, (v, index) => ({
      application_instance_id: applicationInstanceId,
      app_name: `app_name_${index}`,
      api_name: `api_name_${index}`,
    }));

    removeTestData()
      .then(() => common.create(table, insertColumnNames, insertColumnValues))
      .then(() => common.readByColumnsAndValues(selected, table, filterColumns, filterValues))
      .then(result => Code.expect(result.rows).to.have.length(recordsCount))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('Calling create() with an invalid column should cause an exception', done => {
    const recordsCount = 5;
    const table = 'applications';

    const insertColumnNames = [
      'application_instance_id',
      'app_name',
      'invalid_column_name',
    ];

    const insertColumnValues = Array.from({ length: recordsCount }, (v, index) => ({
      application_instance_id: applicationInstanceId,
      app_name: `app_name_${index}`,
      api_name: `api_name_${index}`,
    }));

    common.create(table, insertColumnNames, insertColumnValues)
      .catch(error => {
        Code.expect(error).to.exist();
        done();
      });
  });

  lab.test('Calling create() with no database available should cause an exception', done => {
    const recordsCount = 5;
    const table = 'applications';

    const insertColumnNames = [
      'application_instance_id',
      'app_name',
      'api_name',
    ];

    const insertColumnValues = Array.from({ length: recordsCount }, (v, index) => ({
      application_instance_id: applicationInstanceId,
      app_name: `app_name_${index}`,
      api_name: `api_name_${index}`,
    }));

    const error = new Error('This is an Error object created as part of a test only');
    sinon.stub(dbUtility, 'getDBConnection').callsFake(callback => callback(error, null));

    common.create(table, insertColumnNames, insertColumnValues)
      .catch(error => {
        dbUtility.getDBConnection.restore();
        Code.expect(error).to.exist();
        done();
      });
  });

  after(done => {
    removeTestData()
      .then(() => done())
      .catch(error => console.error(error));
  });
});

lab.experiment('Common (Utility Functions)', () => {
  before(done => {
    addison.getServer()
      .then(() => common = common || require('../src/lib/common'))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('serverError() response should have HTTP error code', done => {
    const error = new Error('This is an Error object created as part of a test only');
    const errorString = 'This is an error message created as part of a test only';

    const server = new Hapi.Server();
    server.connection();

    server.route({
      method: 'GET',
      path: '/',
      handler: (request, reply) => common.serverError(reply, error, errorString),
    });

    server.inject('/', response => {
      Code.expect(response.statusCode).to.equal(500);
      done();
    });
  });

  lab.test('serverError() response should contain provided error string as payload', done => {
    const error = new Error('This is an Error object created as part of a test only');
    const errorString = 'This is an error message created as part of a test only';

    const server = new Hapi.Server();
    server.connection();

    server.route({
      method: 'GET',
      path: '/',
      handler: (request, reply) => common.serverError(reply, error, errorString),
    });

    server.inject('/', response => {
      Code.expect(response.result).to.equal(errorString);
      done();
    });
  });

  lab.test('sortArrayOfObjectsByDateKey() should sort in ascending order', done => {
    const sortOrder = 'ASC';
    const key = 'date';
    const dates = [{
      expectedIndex: 4,
      date: '2017-08-09 00:00:00.004',
    }, {
      expectedIndex: 1,
      date: '2017-08-09 00:00:00.001',
    }, {
      expectedIndex: 3,
      date: '2017-08-09 00:00:00.003',
    }, {
      expectedIndex: 2,
      date: '2017-08-09 00:00:00.002',
    }];

    common.sortArrayOfObjectsByDateKey(dates, key, sortOrder);

    for (let index = 1; index < dates.length; index += 1) {
      const current = dates[index].expectedIndex;
      const previous = dates[index - 1].expectedIndex;
      Code.expect(current).to.be.greaterThan(previous);
    }

    done();
  });

  lab.test('sortArrayOfObjectsByDateKey() should sort in descending order', done => {
    const key = 'date';
    const dates = [{
      expectedIndex: 3,
      date: '2017-08-12',
    }, {
      expectedIndex: 4,
      date: '2017-08-11',
    }, {
      expectedIndex: 1,
      date: '2018-01-01',
    }, {
      expectedIndex: 2,
      date: '2017-08-14',
    }];

    common.sortArrayOfObjectsByDateKey(dates, key);

    for (let index = 1; index < dates.length; index += 1) {
      const current = dates[index].expectedIndex;
      const previous = dates[index - 1].expectedIndex;
      Code.expect(current).to.be.greaterThan(previous);
    }

    done();
  });

  lab.test('sortArrayOfObjectsByDateKey() should not sort if invalid sortOrder is provided', done => {
    const sortOrder = 'INVALID';
    const key = 'date';
    const dates = [{
      expectedIndex: 1,
      date: '2017-08-09 00:00:00.004',
    }, {
      expectedIndex: 2,
      date: '2017-08-09 00:00:00.001',
    }, {
      expectedIndex: 3,
      date: '2017-08-09 00:00:00.003',
    }, {
      expectedIndex: 4,
      date: '2017-08-09 00:00:00.002',
    }];

    common.sortArrayOfObjectsByDateKey(dates, key, sortOrder);

    for (let index = 1; index < dates.length; index += 1) {
      const current = dates[index].expectedIndex;
      const previous = dates[index - 1].expectedIndex;
      Code.expect(current).to.be.greaterThan(previous);
    }

    done();
  });
});
