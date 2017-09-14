var testSetup = require(process.env.PWD + '/tests/test-setup');

// create node environment & instance of expressApp
var nodeAppPath = testSetup.prepareNodeEnvironment();

var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var rek = require('rekuire');
var appMaker = require(nodeAppPath +'/app/app.js');
var chai = require('chai')
var expect = chai.expect;

// used for seed data
var verificationCodesApi = rek('verificationCodes-api');

// used for getting a JWT for hitting secured API calls
var usersApi = rek('users-api');

describe('Express App', function() {
  it('should load without errors', function(done) {
    appMaker.initialize()
      .then(function(expressApp) {
        done();
        runTests(expressApp);
      });
  });
});

var runTests = function(expressApp) {
  describe('verificationCodes-api', function() {
    var verificationCodes;
    var jwt;
    var testDataIndex = 0;
    var lastUpdatedPropertyValue = null;

    var handleError = function(error) {
      console.log('HANDLE ERROR:');
      console.log(error);

      throw error;
    }

    beforeEach(function (done) {
      testSetup.clearDb(mongoose, done);
      verificationCodes = [];
      testDataIndex = 0;
      lastUpdatedPropertyValue = null;
    });

    var createTestDocument = function() {
      var testDocument = {};

testDocument.dateCreated = new Date();
testDocument.userId = 'userId_'+testDataIndex;


      lastUpdatedPropertyValue = testDocument.code;

      testDataIndex++;

      return testDocument;
    };

    var updateTestDocument = function(testDocument) {
testDocument.dateCreated = new Date();
testDocument.userId = 'userId_'+testDataIndex;


      lastUpdatedPropertyValue = testDocument.code;

      testDataIndex++;

      return testDocument;
    }

    var createTestData = function(done) {
      // create a entity
      verificationCodesApi.post(createTestDocument())
      .then(function(newVerificationCode) {
        // capture data for asserts later
        verificationCodes.push(newVerificationCode);

        // create second entity
        verificationCodesApi.post(createTestDocument())
          .then(function(newVerificationCode) {
            // capture new entity for asserts later
            verificationCodes.push(newVerificationCode);
            done();
          })
          .catch(handleError);
      })
      .catch(handleError);
    }

    beforeEach(function(done) {
      // for all tests create a user to get a token
      usersApi.post({ email: 'h@h.com' , fullName: 'mama', password: '1234' })
        .then(function(newUserResponse) {
          jwt = newUserResponse.token;

          createTestData(done);
        })
        .catch(handleError);
    });

    afterEach(function (done) {
      testSetup.disconnect(mongoose, done);
    });

    it('should GET a verificationCode by id', function(done) {
      request(expressApp)
        .get('/api/verificationCodes/' +verificationCodes[0].id)
        .set('Authorization', 'Bearer ' +jwt)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          var verificationCodeFromServer = res.body;

          expect(verificationCodeFromServer._id).to.equal(verificationCodes[0].id);

          if (err) {
            console.log(JSON.stringify(err));
            throw err;
          }
          done();
        });
    });

    it('should DELETE a verificationCode by _id', function(done) {
      request(expressApp)
        .delete('/api/verificationCodes/' +verificationCodes[0].id)
        .set('Authorization', 'Bearer ' +jwt)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (!err) {
            verificationCodesApi.get(verificationCodes[0].id)
              .then(function(verificationCode) {
                expect(verificationCode).to.be.null;
                done();
              });
          } else {
            console.log(JSON.stringify(err));
            throw err;
          }
        });
    });

    it('should POST a verificationCode', function(done) {
      request(expressApp)
        .post('/api/verificationCodes')
        .set('Authorization', 'Bearer ' +jwt)
        .send(createTestDocument())
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          var newVerificationCode = res.body;

          if (!err) {
            verificationCodesApi.get(newVerificationCode._id)
              .then(function(verificationCode) {
                expect(verificationCode).to.be.defined;
                done();
              });
          } else {
            console.log(JSON.stringify(err));
            throw err;
          }
        });
    });

    it('should PUT a verificationCode', function(done) {
      updateTestDocument(verificationCodes[0]);

      request(expressApp)
        .put('/api/verificationCodes/' +verificationCodes[0].id)
        .set('Authorization', 'Bearer ' +jwt)
        .send(verificationCodes[0])
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (!err) {
            verificationCodesApi.get(verificationCodes[0].id)
              .then(function(verificationCode) {
                expect(verificationCode.code).to.equal(lastUpdatedPropertyValue);
                done();
              });
          } else {
            console.log(JSON.stringify(err));
            throw err;
          }
        });
    });

    it('should fetch  a verificationCode using a mongo query', function(done) {
      request(expressApp)
        .post('/api/verificationCodes/query')
        .set('Authorization', 'Bearer ' +jwt)
        .send({
          code: verificationCodes[0].code
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          var verificationCodeFromServer = res.body[0];

          expect(verificationCodeFromServer._id).to.equal(verificationCodes[0].id);

          if (err) {
            console.log(JSON.stringify(err));
            throw err;
          }
          done();
        });
    });

  });
};
