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
let employeesApi; // require this after the schema is registered


describe('employees-repo', () => {
  let empoyees;

  const createTestEmployee = () => {
    const testEmployee = {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
      email: faker.internet.email()
    };

    return fixture.create(testEmployee);
  };

  const createTestData = function() {
    return createTestEmployee();
  };

  beforeEach(function (done) {
    employees = []; // cleanup between tests

    mongoTestSetup.clearDb(mongoose)
                    .then(() => {
                      fixture = rek('employees-repo');

                      return createTestData();
                    })
                    .then(testEmployeeFromDb => {
                      employees.push(testEmployeeFromDb);

                      done();
                    });
  });

  it('creates and queries an employee', done => {
    // this test verifies the employee we created in the beforeEach
    const query = { _id: employees[0]._id };

    fixture.find(query)
      .then(results => {
        expect(results.length).to.equal(1);
        // mongos solution for id comparison
        expect(results[0]._id.equals(employees[0]._id)).to.be.true;

        done();
      })
      .catch(consoleMessages.logToConsole);
  });

  it('updates and queries an employee', done => {
    // this test verifies the employee we created in the beforeEach
    const query = { _id: employees[0]._id };
    const updatedName = faker.name.firstName();
    const employee = Object.assign(employees[0], { first: updatedName });

    fixture.update(employee)
      .then(() => {
        fixture.find(query)
          .then(results => {
            expect(results.length).to.equal(1);
            // mongos solution for id comparison
            expect(results[0].first).to.equal(updatedName);

            done();
          })
          .catch(consoleMessages.logToConsole);
      });
  });
});
