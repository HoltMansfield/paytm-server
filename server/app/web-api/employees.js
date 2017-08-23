const rek = require('rekuire');

const employeeApi = rek('employees-repo');
const errorHandling = rek('error-handling');
const baseUrl = '/api/employees';

const createRoutes = app => {
  // Create
  app.post(baseUrl, (req, res, next) => {
    employeeApi.create(req.body)
      .then(newEmployee => res.json(newEmployee))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Login
  app.post(baseUrl +'/login', (req, res, next) => {
    // this is obviously incredibly stupid and naive
    employeeApi.login({ first: req.body.first, last: req.body.last })
      .then(employeeFromDb => res.json(employeeFromDb))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Update
  app.put(baseUrl, (req, res, next) => {
    employeeApi.update(req.body)
      .then(employeeFromDb => res.json(employeeFromDb))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Find
  app.post(baseUrl +'/query', (req, res, next) => {
    employeeApi.find(req.body)
      .then(results => res.json(results))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Delete
  app.delete(baseUrl +'/query', (req, res, next) => {
    employeeApi.deleteDocument(req.body)
      .then(results => res.json(results))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });
};

module.exports = {
  createRoutes: createRoutes
}
