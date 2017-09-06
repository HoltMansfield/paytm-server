const Promise = require('bluebird');
const rek = require('rekuire');
const mongoose = require('mongoose');

const hasher = rek('password-hasher');
const Participant = mongoose.model('participants');

const createParticipantInDb = (createPasswordResult, participant) => {
  // read in the data from our hashing operation
  participant.password = createPasswordResult.hashedPassword;
  participant.salt = createPasswordResult.salt;

  let participantModel = new Participant(participant);

  return participantModel.save();
};

const create = function(participant) {
  participant.email = participant.email.toLowerCase(); // the db can do case insensitive search but why incur the cost

  return hasher.createPassword(participant.password)
    .then(createPasswordResult => createParticipantInDb(createPasswordResult, participant));
};

const find = function(query) {
  return Participant.find(query);
};

const update = function(participant) {
  // we don't ever update the password in this operation
  delete participant.password;

  // { new: true } will return the updated document
  return Participant.findByIdAndUpdate(participant._id, participant, { new: true });
};

const deleteDocument = function(query) {
  return Participant.remove(query);
};

const authenticateParticipant = function(authenticationAttempt) {
  authenticationAttempt.email = authenticationAttempt.email.toLowerCase(); // the db can do case insensitive search but why incur the cost

  return Participant.findOne({ email: authenticationAttempt.email })
          .then(participantFromDb => {
            return hasher.comparePassword(authenticationAttempt.password, participantFromDb.salt, participantFromDb.password)
          });
};

const updatePassword = function(updatePasswordAttempt) {
  // in this operation we only update the password
  return hasher.hashPassword(updatePasswordAttempt.salt, updatePasswordAttempt.password)
                .then(hashedPasswordResult => {
                  // { new: true } will return the updated document
                  return Participant.findByIdAndUpdate(updatePasswordAttempt._id, { $set: { password: hashedPasswordResult.hashedPassword }}, { new: true })
                });
};

module.exports = {
  create,
  find,
  update,
  deleteDocument,
  authenticateParticipant,
  updatePassword
};
