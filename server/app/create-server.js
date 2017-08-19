const Promise = require('bluebird');
const rek = require('rekuire');
const setupExpress = rek('setup-express');
const routeLoader = rek('auto-load-routes');
const mongoManager = rek('mongo-manager');
const errorHandling  = rek('error-handling');


const doInitalization = () => {
  return setupExpress
          .initialize()
          .then(setupExpress.preRoutesInitalization)
          .then(mongoManager.connect)
          .then(routeLoader.createRoutes)
          .then(setupExpress.postRoutesInitalization)
          .then(setupExpress.listen)
          .catch(errorHandling.handleError);
}

module.exports.createServer = doInitalization;
