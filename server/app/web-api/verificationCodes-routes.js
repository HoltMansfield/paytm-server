const jwt = require('jsonwebtoken');
const rek = require('rekuire');

const verificationCodesRepo = rek('verificationCodes-repo');
const errorHandling = rek('error-handling');


const createRoutes = app => {
  const baseUrl = '/api/verificationCodes';

  // Create
  app.post(baseUrl, (req, res, next) => {
    verificationCodesRepo.create(req.body)
      .then(newVerificationCode => {

        return res.json(newVerificationCode);
      })
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // MongoDB Find()
  app.post(baseUrl +'/query', (req, res, next) => {
    verificationCodesRepo.find(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Update
  app.put(baseUrl, (req, res, next) => {
    verificationCodesRepo.update(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Delete
  app.delete(baseUrl, (req, res, next) => {
    verificationCodesRepo.delete(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });
};

module.exports = {
  createRoutes: createRoutes
}
