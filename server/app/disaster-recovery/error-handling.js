const rek = require('rekuire');

const consoleMessages = rek('console-messages');

const requestErrorHandler = (err, req, res, next) => {
const validationErrors = null;

  /*
      MongoDB tacks on errors property containing validation errors
      We map it to a property called validationErrors below
  */
  if(err && err.errors) {
    validationErrors = err.errors;
  }

  res
  .status(422)
  .json(
  {
      success: false,
      name: err.name,
      message: err.message,
      stack: err.stack,
      validationErrors: validationErrors
  });

  consoleMessages.error(err.message);
};

const errorHandler = err => {
  consoleMessages.error(err);
};

module.exports = {
  errorHandler: errorHandler,
  requestErrorHandler: requestErrorHandler
};
