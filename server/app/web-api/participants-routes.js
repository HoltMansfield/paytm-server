const jwt = require('jsonwebtoken');
const rek = require('rekuire');

const participantsApi = rek('participants-repo');
const errorHandling = rek('error-handling');


const createRoutes = function(app) {
  const baseUrl = '/api/participants';

  // Create
  app.post(baseUrl, (req, res, next) => {
    participantsApi.create(req.body)
      .then(data => {
        const token = jwt.sign(data, 'toDo: use cert');
        const { email, _id } = data

        return res.json({
          user: { email, _id },
          jwt: token
        });
      })
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // MongoDB Find()
  app.post(baseUrl +'/query', (req, res, next) => {
    participantsApi.find(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Update
  app.put(baseUrl, (req, res, next) => {
    participantsApi.update(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Delete
  app.delete(baseUrl, (req, res, next) => {
    participantsApi.deleteDocument(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Login
  app.post(baseUrl +'/authenticate', (req, res, next) => {
    participantsApi.authenticateParticipant(req.body)
      .then(data => {
        const token = jwt.sign(data, 'toDo: use cert');
        const { email, _id } = data

        return res.json({
          user: { email, _id },
          jwt: token
        });
      })
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Update Password
  app.post(baseUrl +'/update-password', (req, res, next) => {
    participantsApi.updatePassword(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

};

module.exports = {
  createRoutes: createRoutes
}
