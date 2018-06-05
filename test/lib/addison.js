'use strict';

const AddisonEngine = require('@hpe/addison-engine');
const serverOptions = {
  environment: 'test',
};

function startServer() {
  return new Promise((resolve, reject) => {
    AddisonEngine.startAddisonServer(serverOptions, (err, server) => {
      if (err) reject(err);
      resolve(server);
    });
  });
}

function getServer() {
  const addisonServer = AddisonEngine.getServer();

  if (addisonServer === undefined) {
    return startServer();
  }

  return new Promise(resolve => {
    resolve(addisonServer);
  });
}

module.exports.getServer = getServer;
