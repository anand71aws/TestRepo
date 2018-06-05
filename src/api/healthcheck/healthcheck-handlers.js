'use strict' ;

const AddisonEngine = require('@hpe/addison-engine');

function healthcheck (request, reply) {
  // Include here whatever validation can check the health of critical 
  // application layers (e.g. database...).
  // This endpoint can then be used to set up regular monitoring using SiteScope

  // Build an object to be returned that can contain more details 
  // (e.g. answer from each component)

  reply({
    status: 'ok',
    environment: AddisonEngine.getEnvironment(),
  });
  // Default is to return an 'ok' status (and HTTP status code 200) 
  // as this endpoint was able to answer
}

exports.healthcheck = healthcheck;

