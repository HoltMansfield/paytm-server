const rek = require('rekuire');
const chai = require('chai');
const sinon = require('sinon');
const consoleMessages = rek('console-messages');
const request = require('supertest');
const mongoose = require('mongoose');

const expect = chai.expect;
const assert = chai.assert;

const createServerOnce = rek('create-server-once');
const mongoTestSetup = rek('mongo-test-setup');
const supertestTestSetup = rek('supertest-test-setup');


describe('express-app', () => {
  it('should load without errors', done => {
    // start the app
    createServerOnce
        .createServerOnce()
        .then(server => {
          expect(server).not.to.be.undefined;
          done();
          runTests(server);
        })
        .catch(consoleMessages.logToConsole);
  });
});

const runTests = function(server) {
  describe('verificationCodes-routes', () => {
    const baseUrl = '/api/verificationCodes';
    let verificationCodes; // retain verificationCode data created in beforeEach
    let jwt;  // jwt needed for hitting secured endpoints
    let testDataIndex = 0; // used for creating test data
    let verificationCodesRepo; // we can't require in the repo module until the mongoose model is registered
    let apiUser; // the authenticated user for testing secure endpoints
    const clearTextPassword = 'clear-text-password-value'; // retain the users password to test logging in

    beforeEach(done => {
      mongoTestSetup.clearDb(mongoose)
        .then(() => {
          verificationCodesRepo = rek('verificationCodes-repo'); // now that collections are imported require in verificationCodes-repo
          verificationCodes = []; //re-initalize and clear our array of verificationCodes
          testDataIndex = 0;

          // create an API user for hitting secure endpoints
          createApiUser()
            .then(() => {
              // create a test verificationCode for querying against
              verificationCodesRepo.create(createTestDocument())
                .then(newVerificationCode => {
                  verificationCodes.push(newVerificationCode);
                  done();
                });
          });
        });
    });

    afterEach(function (done) {
      mongoTestSetup.disconnect(mongoose, done);
    });

    const createTestDocument = function() {
      let testDocument = {};

      testDocument.dateCreated = new Date();
      testDocument.code = 'code_'+testDataIndex;
      testDocument.userId = apiUser._id

      testDataIndex++; // increment to keep test data unique on next execution

      return testDocument;
    };

    const createApiUser = function() {
      // create a user for authenticating with API
      return supertestTestSetup.createTestUserAndToken(server)
        .then(userAndToken => {
          expect(userAndToken).to.have.property('user');
          expect(userAndToken).to.have.property('jwt');

          jwt = userAndToken.jwt;
          apiUser = userAndToken.user;
        });
    };

    it('should POST a verificationCode', function(done) {
      request(server)
        .post('/api/verificationCodes')
        .set('Authorization', 'Bearer ' +jwt)
        .send(createTestDocument())
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          var newVerificationCode = res.body;

          if (!err) {
            verificationCodesRepo.find({ id: newVerificationCode._id })
              .then(function(verificationCode) {
                expect(verificationCode).not.to.be.undefined;
                done();
              });
          } else {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }
        });
    });

    it('should fetch a verificationCode using a mongo query', done => {
      const query = {
          _id: verificationCodes[0].id
      };

      request(server)
        .post(baseUrl +'/query')
        .set('Authorization', 'Bearer ' +jwt)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const verificationCodeFromServer = res.body[0];

          expect(verificationCodeFromServer._id).to.equal(verificationCodes[0].id);

          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }
          done();
        });
    });

    it('should delete a verificationCode', done => {
      const query = {
          id: verificationCodes[0]._id
      };

      request(server)
        .delete(baseUrl)
        .set('Authorization', 'Bearer ' +jwt)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }

          verificationCodesRepo.find(query)
            .then(foundVerificationCode => {
              // assert that the verificationCode can't be found after deletion
              expect(foundVerificationCode.length).to.equal(0);
              done();
            });
        });
    });

    it('should update a verificationCode', done => {
      const updatedFieldValue = 'updated';
      const updatePasswordAttempt = {
          _id: verificationCodes[0]._id,
          code: updatedFieldValue
      };

      request(server)
        .put(baseUrl)
        .set('Authorization', 'Bearer ' +jwt)
        .send(updatePasswordAttempt)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }

          const updatedVerificationCode = res.body;

          expect(updatedVerificationCode.code).to.equal(updatedFieldValue);

          done();
        });
    });

  });
};
