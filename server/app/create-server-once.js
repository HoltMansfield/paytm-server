/*
    We have a series of test suites that test directly against an instance of this express application,
    this ensures we only create the server once
*/

const Promise = require('bluebird');
const rek = require('rekuire');
const createServer = rek('create-server');
const errorHandling  = rek('error-handling');

let server;

const captureServerInstance = (serverInstance) => {
  server = serverInstance;

  return serverInstance;
};

const doCreateServerOnce = () => {
  return createServer
          .createServer(server)
          .then(captureServerInstance)
          .catch(errorHandling.handleError);
};

module.exports.createServerOnce = () => {
  // if the server has already been created
  if(server) {
    // return it
    return Promise.resolve(server);
  } else {
    // server has not been created, create it now
    return doCreateServerOnce();
  }
};
