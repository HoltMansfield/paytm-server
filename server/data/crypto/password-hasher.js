const bcrypt = require('bcrypt-as-promised');
const Promise = require('bluebird');


const hashPassword = (salt, password) => {
  // use that salt to hash the password
  return bcrypt.hash(password, salt)
          .then(hashedPassword => {
            // code downstream needs the hashedPassword & the salt
            return {
              salt: salt,
              hashedPassword: hashedPassword
            };
          });
};

const createPassword = (password) => {
  return bcrypt.genSalt()
          .then(salt => hashPassword(salt, password));
};

const comparePassword = (password, salt, hashedPasswordFromDb) => {
  return bcrypt.hash(password, salt)
          .then(hashedPassword => hashedPasswordFromDb === hashedPassword);
};

module.exports = {
  createPassword,
  comparePassword,
  hashPassword
}
