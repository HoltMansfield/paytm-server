const Promise = require('bluebird');
const mongoose = require('mongoose');
const rek = require('rekuire');


const Review = mongoose.model('Review');

const create = function(review) {
  const reviewModel = new Review(review);

  return reviewModel.save();
};

const update = function(user) {
  // { new: true } will return the updated document
  return Review.findByIdAndUpdate(user._id, user, { new: true });
};

const find = function(query) {
  return Review.find(query);
};

module.exports = {
  create,
  find,
  update
};
