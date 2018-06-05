'use strict';

const fs = require('fs');
const encoding = 'utf8';

module.exports = {

  dbConnection: {
    contactPoints: [
      'hc4t05613.itcs.hpecorp.net:9042',
      'hc4t05714.itcs.hpecorp.net:9042',
      'hc4t05715.itcs.hpecorp.net:9042',
    ],
    authProviderusername: 'entmon_superuser',
    authProviderpassword: 'entmon_superuser',
    keyspace: 'entmon',
  },

  connections: [{
    host: '0.0.0.0',
    port: 8443,
    routes: {
      log: true,
    },
    tls: {
      key: fs.readFileSync('./src/config/local/entmon-workflow-service.key', encoding),
      cert: fs.readFileSync('./src/config/local/entmon-workflow-service.pem', encoding),
    },
  }],
  registrations: [{
    plugin: {
      register: '@hpe/entmon-metrics',
      options: {
        enableentmon: 'true',
        environment: 'staging',
      },
    },
  }],
};
