// Test dependencies
const rek = require('rekuire');
const chai = require('chai');
const sinon = require('sinon');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);
const consoleMessages = rek('console-messages');

const expect = chai.expect;
const assert = chai.assert;

// System Under Test
const fixture = rek('password-hasher');

// require so we can stub/spy
const bcrypt = require('bcrypt-as-promised');

describe('password-hasher', () => {
  describe('createPassword', () => {
    it('should call bcrypt to create a salt and to hash the users password', sinonTest(function(done) {
      const bcryptHashSpy = this.spy(bcrypt, 'hash');
      const bcryptSaltSpy = this.spy(bcrypt, 'genSalt');

      assert.isDefined(fixture);
      const password = 'clear-text';

      fixture.createPassword(password)
        .then(createPasswordResult => {
          assert.isDefined(createPasswordResult.salt);
          assert.isDefined(createPasswordResult.hashedPassword);

          sinon.assert.callCount(bcryptHashSpy, 1);
          sinon.assert.callCount(bcryptSaltSpy, 1);

          done();
        })
        .catch(consoleMessages.logToConsole);
    }));
  });

  describe('comparePassword', () => {
    it('should return true when the user enters a valid password', done => {
      const clearTextPassword = 'mock-password';

      fixture.createPassword(clearTextPassword)
        .then(createPasswordResult => {
          fixture.comparePassword(clearTextPassword, createPasswordResult.salt, createPasswordResult.hashedPassword)
            .then(comparePasswordResult => {
              expect(comparePasswordResult).to.equal(true);

              done();
            })
            .catch(consoleMessages.logToConsole);
        })
        .catch(consoleMessages.logToConsole);
    });

    it('should return FALSE when the user enters an INVALID password', done => {
      const clearTextPassword = 'mock-password';

      fixture.createPassword(clearTextPassword)
        .then(createPasswordResult => {
          fixture.comparePassword('invalid-password-attempt', createPasswordResult.salt, createPasswordResult.hashedPassword)
            .then(comparePasswordResult => {
              expect(comparePasswordResult).to.equal(false);

              done();
            })
            .catch(consoleMessages.logToConsole);
        })
        .catch(consoleMessages.logToConsole);
    });
  });

  describe('hashPassword', () => {
    it('should call bcrypt to hash the users password with an existing salt', sinonTest(function(done) {
      const bcryptHashSpy = this.spy(bcrypt, 'hash');
      const password = 'clear-text';

      bcrypt.genSalt()
              .then(salt => {
                fixture.hashPassword(salt, password)
                  .then(hashedPassword => {
                    assert.isDefined(hashedPassword);
                    sinon.assert.callCount(bcryptHashSpy, 1);

                    done();
                  })
              })
              .catch(consoleMessages.logToConsole);;
    }));
  });
});
