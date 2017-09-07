var mongoose = require('mongoose');
var Promise = require("bluebird");
var R = require('ramda');
var async = require('async');
var db = require('../mongo-manager');


var get = function(id) {
  return db.models.verificationCodes
           .findOne({ _id: id })
           .then(function(verificationCode) {
             return verificationCode;
           });
};

var put = function(id, verificationCode) {
  var upsertData = R.clone(verificationCode);
  delete upsertData._id;

  return db.models.verificationCodes
           .updateAsync({_id: id}, upsertData, {upsert: true})
           .then(function(verificationCode) {
             return 'success';
           });
};

var post = function(verificationCode) {
  var verificationCodeModel = new db.models.verificationCodes(verificationCode);

  return verificationCodeModel.saveAsync()
    // We need to use `spread` because `model.save` yields an array
    .spread(function(newVerificationCode) {
      return newVerificationCode;
    });
};

var query = function(query) {
  return db.models.verificationCodes
           .find(query)
           .then(function(verificationCode) {
             return verificationCode;
           });
};

var d = function(id, user) {
  return db.models.verificationCodes
           .findOne({ _id: id })
           .then(function(verificationCode) {
             return verificationCode.remove();
           });
};

module.exports.get = get;
module.exports.put = put;
module.exports.post = post;
module.exports.query = query;
module.exports.delete = d;
