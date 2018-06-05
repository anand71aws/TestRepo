'use strict';

const dse = require('dse-driver');
const AddisonEngine = require('@hpe/addison-engine');

const contactPoints = AddisonEngine.getConfig('/dbConnection/contactPoints');
const user = AddisonEngine.getConfig('/dbConnection/authProviderusername');
const password = AddisonEngine.getConfig('/dbConnection/authProviderpassword');
const keyspace = AddisonEngine.getConfig('/dbConnection/keyspace');

const options = {
  contactPoints,
  keyspace,
  authProvider: new dse.auth.PlainTextAuthProvider(user, password),
};

const client = new dse.Client(options);

client.connect(err => {
  if (err) {
    return console.error(`Problem connecting to the database ${err}`);
  }

  console.log(`Connected to cluster with ${client.hosts.length} host(s): ${client.hosts.keys()}`);
});


function getDBConnection (callback) {
  return callback(null, client);
}

exports.getDBConnection = getDBConnection;
