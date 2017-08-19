const chalk = require('chalk');
const beep = require('beepbeep');

const error = chalk.red.bold;
const log = chalk.green.bold;

module.exports.error = message => {
  console.log(error('**************** An error has occurred ****************'));
  console.log(error(`\n ${message} \n`));
  beep(1);
};

module.exports.criticalError = message => {
  console.log(error('@@@@@@@@@@@@@@ A CRITICAL error has occurred @@@@@@@@@@@@@@'));
  console.log(error(`\n ${message} \n`));

  beep(3);
};

module.exports.log = message => {
  console.log(log(`\n ${message} \n`))
}
