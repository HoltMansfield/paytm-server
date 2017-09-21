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
  describe('participants-routes', () => {
    const baseUrl = '/api/participants';
    let participants; // retain participant data created in beforeEach
    let jwt;  // jwt needed for hitting secured endpoints
    let participantsRepo; // we can't require in the participantsRepo module until the mongoose model is registered
    let apiParticipant; // the authenticated participant for testing secure endpoints
    const clearTextPassword = 'clear-text-password-value'; // retain the participants password to test logging in

    beforeEach(done => {
      mongoTestSetup.clearDb(mongoose)
        .then(() => {
          participantsRepo = rek('participants-repo'); // now that collections are imported require in userApi
          participants = []; //re-initalize and clear our array of participants

          // create a test participant for querying against
          createTestParticipant()
            .then(newParticipant => {
              participants.push(newParticipant);

              // create an API participant for hitting secure endpoints
              createApiParticipant()
                .then(done);
            });
        });
    });

    afterEach(function (done) {
      mongoTestSetup.disconnect(mongoose, done);
    });

    const createTestParticipant = function() {
      const testParticipant = {
        email: 'beforeEach-created-participant@test.com',
        password: clearTextPassword,
        first: 'first-name-test-value'
      };

      return participantsRepo.create(testParticipant);
    };

    const createApiParticipant = function() {
      // create a participant for authenticating with API
      return supertestTestSetup.createTestUserAndToken(server)
        .then(userAndToken => {
          expect(userAndToken).to.have.property('user');
          expect(userAndToken).to.have.property('jwt');

          jwt = userAndToken.jwt;
          apiParticipant = userAndToken.user;
        });
    };

    it('should fetch a participant using a mongo query', done => {
      const query = {
          email: participants[0].email.toLowerCase()
      };

      request(server)
        .post(baseUrl +'/query')
        .set('Authorization', 'Bearer ' +jwt)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const userFromServer = res.body[0];

          expect(userFromServer._id).to.equal(participants[0].id);

          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }
          done();
        });
    });

    it('should update a participant', done => {
      const newFirstNameValue = 'update-first-name-value';;
      participants[0].first = newFirstNameValue;

      request(server)
        .put(baseUrl)
        .set('Authorization', 'Bearer ' +jwt)
        .send(participants[0])
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const userFromServer = res.body;

          expect(userFromServer.first).to.equal(newFirstNameValue);

          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }
          done();
        });
    });

    it('should delete a participant', done => {
      const query = {
          email: participants[0].email.toLowerCase()
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

          participantsRepo.find(query)
            .then(foundParticipant => {
              // assert that the participant can't be found after deletion
              expect(foundParticipant.length).to.equal(0);
              done();
            });
        });
    });

    it('should authenticate a participant', done => {
      const loginAttempt = {
          email: participants[0].email.toLowerCase(),
          password: clearTextPassword,
      };

      request(server)
        .post(baseUrl +'/authenticate')
        .send(loginAttempt)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }

          const responseValue = res.body;

          expect(responseValue.user.email).to.equal(participants[0].email);
          done();
        });
    });

    it('should update a participants password', done => {
      const updatedPassword = clearTextPassword +'updated';
      const updatePasswordAttempt = {
          _id: participants[0]._id,
          password: updatedPassword,
          salt: participants[0].salt
      };

      request(server)
        .post(baseUrl +'/update-password')
        .set('Authorization', 'Bearer ' +jwt)
        .send(updatePasswordAttempt)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }

          const updatedParticipant = res.body;

          expect(updatedParticipant).not.to.be.undefined;
          expect(updatedParticipant.password).not.to.be.undefined;
          // need to assert hasher.hashPassword was called, & findByIdAndUpdate was called
          expect(updatedParticipant.password).to.not.equal(updatedPassword);

          done();
        });
    });

  });
};
