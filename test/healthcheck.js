'use strict';

const Code = require('code');
const Lab = require('lab');
const addison = require('./lib/addison');

const lab = exports.lab = Lab.script();
const before = lab.before;

let server = null;

lab.experiment('Health check API', () => {
  before(done => {
    addison.getServer()
      .then(addisonServer => {
        server = addisonServer;
        done();
      });
  });

  lab.test('Health check API responds with status', done => {
    const options = {
      method: 'GET',
      url: '/healthcheck',
    };

    server.inject(options, response => {
      Code.expect(response.statusCode).to.equal(200);
      const jsonPayload = JSON.parse(response.payload);

      Code.expect(jsonPayload).to.contain('status');
      Code.expect(jsonPayload.status).to.equal('ok');
      done();
    });
  });
});
