// Test dependencies
const rek = require('rekuire');
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');

const expect = chai.expect;
const assert = chai.assert;


const runTests = function(resolve, reject, server) {
  const baseUrl = '/api/participants';

  const testUser = {
    email: 'post-user-created-user@test.com',
    password: 'password-value',
    first: 'first-name-test-value'
  };

  request(server)
    .post(baseUrl)
    .send(testUser)
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      const responseBody = res.body;

      if (err) {
        console.log(JSON.stringify(err));
        reject(err);
      }

      // beforeEach in participants-routes-e2e-tests.js does a weak assertion on this response
      resolve(responseBody);
    });
};

const createTestUserAndToken = function(server) {
  return new Promise((resolve, reject) => {
    runTests(resolve, reject, server);
  });
};


module.exports = {
  createTestUserAndToken
}
