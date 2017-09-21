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
  describe('alerts-routes', () => {
    const baseUrl = '/api/alerts';
    let alerts; // retain alert data created in beforeEach
    let jwt;  // jwt needed for hitting secured endpoints
    let testDataIndex = 0; // used for creating test data
    let alertsRepo; // we can't require in the repo module until the mongoose model is registered
    let apiUser; // the authenticated user for testing secure endpoints
    const clearTextPassword = 'clear-text-password-value'; // retain the users password to test logging in

    beforeEach(done => {
      mongoTestSetup.clearDb(mongoose)
        .then(() => {
          alertsRepo = rek('alerts-repo'); // now that collections are imported require in alerts-repo
          alerts = []; //re-initalize and clear our array of alerts
          testDataIndex = 0;
          // create a test alert for querying against
          alertsRepo.create(createTestDocument())
            .then(newAlert => {
              alerts.push(newAlert);

              // create an API user for hitting secure endpoints
              createApiUser()
                .then(done);
            });
        });
    });

    afterEach(function (done) {
      mongoTestSetup.disconnect(mongoose, done);
    });

    const createTestDocument = function() {
      let testDocument = {};

      testDocument.title = 'title_'+testDataIndex;
testDocument.body = 'body_'+testDataIndex;
testDocument.dateCreated = new Date();


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

    it('should POST a alert', function(done) {
      request(server)
        .post('/api/alerts')
        .set('Authorization', 'Bearer ' +jwt)
        .send(createTestDocument())
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          var newAlert = res.body;

          if (!err) {
            alertsRepo.find({ id: newAlert._id })
              .then(function(alert) {
                expect(alert).not.to.be.undefined;
                done();
              });
          } else {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }
        });
    });

    it('should fetch a alert using a mongo query', done => {
      const query = {
          _id: alerts[0].id
      };

      request(server)
        .post(baseUrl +'/query')
        .set('Authorization', 'Bearer ' +jwt)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const alertFromServer = res.body[0];

          expect(alertFromServer._id).to.equal(alerts[0].id);

          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }
          done();
        });
    });

    it('should delete a alert', done => {
      const query = {
          id: alerts[0]._id
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

          alertsRepo.find(query)
            .then(foundAlert => {
              // assert that the alert can't be found after deletion
              expect(foundAlert.length).to.equal(0);
              done();
            });
        });
    });

    it('should update a alert', done => {
      const updatedFieldValue = 'updated';
      const updatePasswordAttempt = {
          _id: alerts[0]._id,
          title: updatedFieldValue
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

          const updatedAlert = res.body;

          expect(updatedAlert.title).to.equal(updatedFieldValue);

          done();
        });
    });

  });
};
