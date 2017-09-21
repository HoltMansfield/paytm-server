const jwt = require('jsonwebtoken');
const rek = require('rekuire');

const alertsRepo = rek('alerts-repo');
const errorHandling = rek('error-handling');


const createRoutes = app => {
  const baseUrl = '/api/alerts';

  // Create
  app.post(baseUrl, (req, res, next) => {
    alertsRepo.create(req.body)
      .then(newAlert => {

        return res.json(newAlert);
      })
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // MongoDB Find()
  app.post(baseUrl +'/query', (req, res, next) => {
    alertsRepo.find(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Update
  app.put(baseUrl, (req, res, next) => {
    alertsRepo.update(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Delete
  app.delete(baseUrl, (req, res, next) => {
    alertsRepo.delete(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });
};

module.exports = {
  createRoutes: createRoutes
}
