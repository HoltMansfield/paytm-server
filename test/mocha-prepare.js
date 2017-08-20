// https://www.npmjs.com/package/mocha-prepare

const prepare = require('mocha-prepare');

prepare(done => {
  // called before loading of test cases
  process.env.NODE_ENV = 'test';
  done();
}, done =>  {
  // called after all test completes (regardless of errors)
  done();
});
