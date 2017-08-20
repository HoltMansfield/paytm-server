const chalk = require('chalk');
const beep = require('beepbeep');

const errorStyle = chalk.red.bold;
const logStyle = chalk.green.bold;

const error = message => {
  console.log(errorStyle('**************** An error has occurred ****************'));
  console.log(errorStyle(`\n ${message} \n`));
  beep(1);
};

const criticalError = message => {
  console.log(errorStyle('@@@@@@@@@@@@@@ A CRITICAL error has occurred @@@@@@@@@@@@@@'));
  console.log(errorStyle(`\n ${message} \n`));

  beep(3);
};

const log = message => {
  console.log(logStyle(`\n ${message} \n`))
}

const _logStringOrObject = message => {
  if(typeof message === 'object') {
    console.log(errorStyle(JSON.stringify(message)));
  } else {
    console.log(errorStyle(message));
  }
}

const logTestError = message => {
  if(message !== null) {
    if(message.message) {
      _logStringOrObject(message.message);
    } else {
      _logStringOrObject(message);
    }

  } else {
    console.log(errorStyle('\'message\' is null in logToConsole()'));
  }
};

module.exports = {
  error,
  criticalError,
  log,
  logTestError
}
