// Test dependencies
const rek = require('rekuire');
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const faker = require('faker');
const consoleMessages = rek('console-messages');

const mongoTestSetup = rek('mongo-test-setup');

const expect = chai.expect;
const assert = chai.assert;


// System Under Test
let fixture; // require this after the schema is registered
let reviewsApi; // require this after the schema is registered


describe('reviews-repo', () => {
  let empoyees;

  const createTestReview = () => {
    const testReview = {
      score: 5,
      comments: faker.hacker.phrase()
    };

    return fixture.create(testReview);
  };

  const createTestData = function() {
    return createTestReview();
  };

  beforeEach(function (done) {
    reviews = []; // cleanup between tests

    mongoTestSetup.clearDb(mongoose)
                    .then(() => {
                      fixture = rek('reviews-repo');

                      return createTestData();
                    })
                    .then(testReviewFromDb => {
                      reviews.push(testReviewFromDb);

                      done();
                    });
  });

  it('creates and queries an review', done => {
    // this test verifies the review we created in the beforeEach
    const query = { _id: reviews[0]._id };

    fixture.find(query)
      .then(results => {
        expect(results.length).to.equal(1);
        // mongos solution for id comparison
        expect(results[0]._id.equals(reviews[0]._id)).to.be.true;

        done();
      })
      .catch(consoleMessages.logToConsole);
  });

  it('updates and queries an review', done => {
    // this test verifies the review we created in the beforeEach
    const query = { _id: reviews[0]._id };
    const updatedComments = faker.hacker.phrase();
    const review = Object.assign(reviews[0], { comments: updatedComments });

    fixture.update(review)
      .then(() => {
        fixture.find(query)
          .then(results => {
            expect(results.length).to.equal(1);
            // mongos solution for id comparison
            expect(results[0].comments).to.equal(updatedComments);

            done();
          })
          .catch(consoleMessages.logToConsole);
      });
  });
});
