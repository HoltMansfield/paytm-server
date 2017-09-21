// Test dependencies
const rek = require('rekuire');
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const consoleErrors = rek('console-messages');

const mongoTestSetup = rek('mongo-test-setup');

const expect = chai.expect;
const assert = chai.assert;


// System Under Test
let fixture; // require this after the Model is registered


describe('participants-api', () => {
  let testParticipant; let testParticipantPassword = 'test-user-password';

  const createTestParticipant = function() {
    // now that our mongoose schemas are registered
    fixture = rek('participants-repo');

    testParticipant = {
      email: 'beforeEach-created-user@test.com',
      password: testParticipantPassword,
      first: 'first-name-test-value'
    };

    return fixture.create(testParticipant);
  };

  beforeEach(function (done) {
    mongoTestSetup.clearDb(mongoose)
                    .then(() => {
                      return createTestParticipant();
                    })
                    .then(testParticipantFromDb => {
                      //read in the ID only so we keep testParticipant as a POJO
                      testParticipant._id = testParticipantFromDb.id;
                      testParticipant.salt = testParticipant.salt;

                      done();
                    });
  });

  afterEach(function (done) {
    mongoTestSetup.disconnect(mongoose, done);
  });

  it('createParticipant returns user with ID', done => {
    const clearTextPassword = 'mama';
    const mixedCaseEmail = 'tesT@tesT.com';

    const participant = {
      email: mixedCaseEmail,
      password: clearTextPassword
    };

    fixture.create(participant)
      .then(participantFromDb => {
        expect(participantFromDb.salt).to.not.be.undefined;
        expect(participantFromDb.password).to.not.equal(clearTextPassword);
        expect(participant.email).to.not.equal(mixedCaseEmail);
        done();
      })
      .catch(consoleErrors.logToConsole);
  });

  it('authenticateParticipant returns true for valid attempt', done => {
    // our beforeEach creates a test user we can query against

    fixture.authenticateParticipant({
        email: testParticipant.email,
        password: testParticipantPassword
      })
      .then(authenticationResult => {
        console.log('\n  authenticationResult %j  \n', authenticationResult)
        console.log('\n  testParticipant %j  \n', testParticipant)
        expect(authenticationResult._id.equals(testParticipant._id)).to.be.true;
        done();
      })
      .catch(consoleErrors.logToConsole);
  });

  it('findParticipant returns user for valid query', done => {
    // our beforeEach creates a test user we can query against
    const query = { _id: testParticipant._id };

    fixture.find(query)
      .then(foundParticipants => {
        expect(foundParticipants[0]).to.not.be.undefined;
        expect(foundParticipants[0].id).to.not.be.undefined;
        expect(foundParticipants[0].id).to.equal(testParticipant._id);
        done();
      })
      .catch(consoleErrors.logToConsole);
  });

  it('updates any fields on the user', done => {
    // our beforeEach creates a test user we can query against
    const updatedName = testParticipant.first +'-updated-value';
    const udpatedPassword = 'new-password-value';

    testParticipant.first = updatedName;
    testParticipant.password = udpatedPassword;

    // update the user
    fixture.update(testParticipant)
      .then(() => {
        const query = { _id: testParticipant._id };

        // fetch the user back from the DB
        fixture.find(query)
          .then(foundParticipants => {
            expect(foundParticipants).to.not.be.undefined;
            expect(foundParticipants[0].first).to.not.be.undefined;
            expect(foundParticipants[0].first).to.equal(updatedName);
            expect(foundParticipants[0].password).to.not.equal(udpatedPassword)
            done();
          });
      })
      .catch(consoleErrors.logToConsole);
  });

  it('updates JUST the password field on the user', done => {
    // our beforeEach creates a test user we can query against
    const udpatedPassword = 'new-password-value';

    testParticipant.password = udpatedPassword;

    // update the user
    fixture.updatePassword(testParticipant)
      .then(() => {
        const query = { _id: testParticipant._id };

        // fetch the user back from the DB
        fixture.find(query)
          .then(foundParticipants => {
            expect(foundParticipants).to.not.be.undefined;
            expect(foundParticipants[0].password).to.not.be.undefined;
            expect(foundParticipants[0].password).to.not.equal(udpatedPassword)
            done();
          });
      })
      .catch(consoleErrors.logToConsole);
  });

  it('deletes the user', done => {
    // our beforeEach creates a test user we can query against
    const query = { _id: testParticipant._id };

    fixture.deleteDocument(query)
      .then(() => {

        // fetch the user back from the DB
        fixture.find(query)
          .then(foundParticipants => {
            expect(foundParticipants).to.have.lengthOf(0);
            done();
          });
      })
      .catch(consoleErrors.logToConsole);
  });
});
