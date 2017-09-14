const Promise = require('bluebird');
const rek = require('rekuire');
const mongoose = require('mongoose');
const VerificationCode = mongoose.model('verificationCodes');


const create = function(verificationCode) {
  let verificationCodeModel = new VerificationCode(verificationCode);

  return verificationCodeModel.save();
};

const find = function(query) {
  return VerificationCode.find(query);
};

const update = function(verificationCode) {
  // { new: true } will return the updated document
  return VerificationCode.findByIdAndUpdate(verificationCode._id, verificationCode, { new: true });
};

const deleteDocument = function(query) {
  return VerificationCode.remove(query);
};

module.exports = {
  create,
  find,
  update,
  delete: deleteDocument
};
