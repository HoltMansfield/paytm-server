const Promise = require('bluebird');
const rek = require('rekuire');
const mongoose = require('mongoose');

const hasher = rek('password-hasher');
const User = mongoose.model('Participant');

const createUserInDb = function(createPasswordResult, user) {
  // read in the data from our hashing operation
  user.password = createPasswordResult.hashedPassword;
  user.salt = createPasswordResult.salt;

  let userModel = new User(user);

  return userModel.save();
};

const create = function(user) {
  user.email = user.email.toLowerCase(); // the db can do case insensitive search but why incur the cost

  return hasher.createPassword(user.password)
    .then(createPasswordResult => createUserInDb(createPasswordResult, user));
};

const find = function(query) {
  return User.find(query);
};

const update = function(user) {
  // we don't ever update the password in this operation
  delete user.password;

  // { new: true } will return the updated document
  return User.findByIdAndUpdate(user._id, user, { new: true });
};

const deleteDocument = function(query) {
  return User.remove(query);
};

const authenticateUser = function(authenticationAttempt) {
  authenticationAttempt.email = authenticationAttempt.email.toLowerCase(); // the db can do case insensitive search but why incur the cost

  return User.findOne({ email: authenticationAttempt.email })
          .then(userFromDb => {
            return hasher.comparePassword(authenticationAttempt.password, userFromDb.salt, userFromDb.password)
          });
};

const updatePassword = function(updatePasswordAttempt) {
  // in this operation we only update the password
  return hasher.hashPassword(updatePasswordAttempt.salt, updatePasswordAttempt.password)
                .then(hashedPasswordResult => {
                  // { new: true } will return the updated document
                  return User.findByIdAndUpdate(updatePasswordAttempt._id, { $set: { password: hashedPasswordResult.hashedPassword }}, { new: true })
                });
};

module.exports = {
  create: create,
  find: find,
  update: update,
  delete: deleteDocument,
  authenticateUser: authenticateUser,
  updatePassword: updatePassword
};
