const Promise = require('bluebird');
const mongoose = require('mongoose');
const rek = require('rekuire');


const Employee = mongoose.model('Employee');

const create = function(employee) {
  const employeeModel = new Employee(employee);

  return employeeModel.save();
};

const update = function(user) {
  // { new: true } will return the updated document
  return Employee.findByIdAndUpdate(user._id, user, { new: true });
};

const deleteDocument = function(query) {
  return Employee.remove(query);
};

const find = function(query) {
  return Employee.find(query);
};

module.exports = {
  create,
  update,
  deleteDocument,
  find
};
