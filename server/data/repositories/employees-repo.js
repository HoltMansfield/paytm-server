const Promise = require('bluebird');
const mongoose = require('mongoose');
const rek = require('rekuire');


const Employee = mongoose.model('Employee');

const create = function(employee) {
  const employeeModel = new Employee(employee);

  return employeeModel.save();
};

const find = function(query) {
  return Employee.find(query);
};

module.exports = {
  create: create,
  find: find
};
