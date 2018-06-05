'use strict';

const Code = require('code');
const Lab = require('lab');
const addison = require('./lib/addison');
const TimeUuid = require('dse-driver').types.TimeUuid;
const lab = exports.lab = Lab.script();
const before = lab.before;
const after = lab.after;

let server = null;
let common = null;


lab.experiment('get-my-workflows API', () => {
  const testRunTime = Date.now();
  const workflowUserMappingTable = 'user_workflow_mapping';
  const workflowTable = 'workflows';
  const applicationConsumerTable = 'application_consumer_mapping';

  const workflowId = TimeUuid.now();
  const workflowName = `wName_${testRunTime}`;
  const userEmail = `test_${testRunTime}`;
  const userRole = `admin_${testRunTime}`;
  const appName = `testApp_${testRunTime}`;
  const apiName = `testapi_${testRunTime}`;
  const applicationInstanceId = `12345-${appName}`;
  const applicationConsumerId = 'test123';

  const workflowUserMappingcolumns = [
    'workflow_id',
    'workflow_group_name',
    'user_email',
    'user_role',
  ];

  const workflowUserMappingRows = [{
    workflow_id: workflowId,
    workflow_group_name: workflowName,
    user_email: userEmail,
    user_role: userRole,
  }];

  const workflowColumns = [
    'app_name',
    'application_instance_id',
    'api_name',
    'workflow_name',
    'workflow_id',
  ];

  const workflowRows = [{
    app_name: appName,
    api_name: apiName,
    application_instance_id: applicationInstanceId,
    workflow_name: workflowName,
    workflow_id: workflowId,
  }];

  const consumerColumns = [
    'api_name',
    'application_consumer_id',
    'application_instance_id',
  ];

  const consumerRows = [{
    api_name: apiName,
    application_consumer_id: applicationConsumerId,
    application_instance_id: applicationInstanceId,
  }];

  before(done => {
    addison.getServer()
      .then(addisonServer => server = addisonServer)
      .then(() => common = common || require('../src/lib/common'))
      .then(() => common.create(workflowUserMappingTable, workflowUserMappingcolumns, workflowUserMappingRows))
      .then(() => common.create(workflowTable, workflowColumns, workflowRows))
      .then(() => common.create(applicationConsumerTable, consumerColumns, consumerRows))
      .then(() => done())
      .catch(error => console.error(error));
  });

  lab.test('Responds with error with no e-mail provided', done => {
    const options = {
      method: 'GET',
      url: '/get-my-workflows',
    };

    server.inject(options, response => {
      const payload = JSON.parse(response.payload);
      Code.expect(response.statusCode).to.equal(400);
      Code.expect(payload.error).to.equal('Bad Request');
      done();
    });
  });


  lab.test('Responds with a JSON object when an e-mail is provided', done => {
    const options = {
      method: 'GET',
      url: `/get-my-workflows?user_email=${testRunTime}@hpe.com`,
    };

    server.inject(options, response => {
      const payload = JSON.parse(response.payload);
      Code.expect(payload).to.be.an.array();
      done();
    });
  });

  after(done => {
    common.destroy(workflowUserMappingTable, 'user_email', userEmail)
      .then(() => common.destroy(workflowTable, 'workflow_id', workflowId))
      .then(() => common.destroy(applicationConsumerTable, 'application_instance_id', applicationInstanceId))
      .then(() => done())
      .catch(error => console.error(error));
  });
});
