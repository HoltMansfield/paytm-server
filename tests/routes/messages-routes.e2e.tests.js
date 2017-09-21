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
  describe('messages-routes', () => {
    const baseUrl = '/api/messages';
    let messages; // retain message data created in beforeEach
    let jwt;  // jwt needed for hitting secured endpoints
    let testDataIndex = 0; // used for creating test data
    let messagesRepo; // we can't require in the repo module until the mongoose model is registered
    let apiUser; // the authenticated user for testing secure endpoints
    const clearTextPassword = 'clear-text-password-value'; // retain the users password to test logging in

    beforeEach(done => {
      mongoTestSetup.clearDb(mongoose)
        .then(() => {
          messagesRepo = rek('messages-repo'); // now that collections are imported require in messages-repo
          messages = []; //re-initalize and clear our array of messages
          testDataIndex = 0;
          // create a test message for querying against
          messagesRepo.create(createTestDocument())
            .then(newMessage => {
              messages.push(newMessage);

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

    it('should POST a message', function(done) {
      request(server)
        .post('/api/messages')
        .set('Authorization', 'Bearer ' +jwt)
        .send(createTestDocument())
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          var newMessage = res.body;

          if (!err) {
            messagesRepo.find({ id: newMessage._id })
              .then(function(message) {
                expect(message).not.to.be.undefined;
                done();
              });
          } else {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }
        });
    });

    it('should fetch a message using a mongo query', done => {
      const query = {
          _id: messages[0].id
      };

      request(server)
        .post(baseUrl +'/query')
        .set('Authorization', 'Bearer ' +jwt)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const messageFromServer = res.body[0];

          expect(messageFromServer._id).to.equal(messages[0].id);

          if (err) {
            consoleMessages.log(JSON.stringify(err));
            throw err;
          }
          done();
        });
    });

    it('should delete a message', done => {
      const query = {
          id: messages[0]._id
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

          messagesRepo.find(query)
            .then(foundMessage => {
              // assert that the message can't be found after deletion
              expect(foundMessage.length).to.equal(0);
              done();
            });
        });
    });

    it('should update a message', done => {
      const updatedFieldValue = 'updated';
      const updatePasswordAttempt = {
          _id: messages[0]._id,
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

          const updatedMessage = res.body;

          expect(updatedMessage.title).to.equal(updatedFieldValue);

          done();
        });
    });

  });
};
