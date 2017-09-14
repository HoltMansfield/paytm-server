const rek = require('rekuire');

const consoleMessages = rek('console-messages');

const mapMessages = message => {
  switch(message) {
    case 'E11000 duplicate key error collection: srs.participants index: email_1 dup key: { : "holtmansfield@gmail.com" }':
      return 'An account already exists with that email'
  }

  return message
}

const requestErrorHandler = (err, req, res, next) => {
  let validationErrors = null;

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
      message: mapMessages(err.message),
      stack: err.stack,//ToDo: check env var and only send in dev, staging
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
