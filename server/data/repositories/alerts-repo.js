const Promise = require('bluebird');
const rek = require('rekuire');
const mongoose = require('mongoose');
const Alert = mongoose.model('alerts');


const create = function(alert) {
  let alertModel = new Alert(alert);

  return alertModel.save();
};

const find = function(query) {
  return Alert.find(query);
};

const update = function(alert) {
  // { new: true } will return the updated document
  return Alert.findByIdAndUpdate(alert._id, alert, { new: true });
};

const deleteDocument = function(query) {
  return Alert.remove(query);
};

module.exports = {
  create,
  find,
  update,
  delete: deleteDocument
};
