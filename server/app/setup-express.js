const Promise = require('bluebird');
const rek = require('rekuire');
const express    = require('express');
const bodyParser = require('body-parser')
const errorHandling  = rek('error-handling');
const consoleMessages = rek('console-messages');

// the first method called during server startup
const initialize = function() {
  return new Promise((resolve, reject) => {
    const app = express();

    resolve(app);
  });
};

// Middleware that needs to be configured BEFORE routes are created
const preRoutesInitalization = function(app) {
    return new Promise((resolve, reject) => {
      // parse application/json
      app.use(bodyParser.json())

      resolve(app);
    });
};

// Middleware that needs to be configured AFTER routes are created
const postRoutesInitalization = function(app) {
    return new Promise((resolve, reject) => {
        /*
            api route handlers are the entry point to this api-server
            the route handlers use tight promise chains and handle their own errors

            nothing should ever bubble up to this global error handler
            if it does, this error handler is here to let us know we have a leak in our promise chains/error handling
        */
        app.use(errorHandling.requestErrorHandler);

        resolve(app);
    });
};

// The actual http listener
const listen = function(app) {
  return new Promise((resolve, reject) => {
    // default to port 300
    process.env.PORT = process.env.PORT || 3000;

    // default to the development environment
    process.env.NODE_ENV = 'development';

    app.set('port', process.env.PORT);

    app.listen(app.get('port'), () => {
       resolve(app);
       consoleMessages.log(`Server is listening on ${app.get('port')}`)
    });
  });
};

// note: routes are created in: /server/app/web-api/auto-load-routes.js
module.exports = {
  initialize: initialize,
  preRoutesInitalization: preRoutesInitalization,
  postRoutesInitalization: postRoutesInitalization,
  listen: listen
};
