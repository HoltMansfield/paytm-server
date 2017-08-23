const Promise = require('bluebird');
const mongoose = require('mongoose');
const rek = require('rekuire');


const Employee = mongoose.model('Employee');

const create = employee => {
  const employeeModel = new Employee(employee);

  return employeeModel.save();
};

const login = query => {
  // this is obviously incredibly stupid and naive
  return Employee.find(query)
    .then(employees => {
      console.log('query', query);
      console.log('employees length:', employees.length);
      if(employees.length == 1) {
        return employees[0];
      }

      return undefined;
    });
}

const update = employee => {
  // { new: true } will return the updated document
  return Employee.findByIdAndUpdate(employee._id, user, { new: true });
};

const deleteDocument = query => {
  return Employee.remove(query);
};

const find = query => {
  return Employee.find(query);
};

module.exports = {
  create,
  login,
  update,
  deleteDocument,
  find
};
