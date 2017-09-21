const Promise = require('bluebird');
const rek = require('rekuire');
const mongoose = require('mongoose');
const Message = mongoose.model('messages');


const create = function(message) {
  let messageModel = new Message(message);

  return messageModel.save();
};

const find = function(query) {
  return Message.find(query);
};

const update = function(message) {
  // { new: true } will return the updated document
  return Message.findByIdAndUpdate(message._id, message, { new: true });
};

const deleteDocument = function(query) {
  return Message.remove(query);
};

module.exports = {
  create,
  find,
  update,
  delete: deleteDocument
};
