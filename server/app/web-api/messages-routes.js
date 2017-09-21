const jwt = require('jsonwebtoken');
const rek = require('rekuire');

const messagesRepo = rek('messages-repo');
const errorHandling = rek('error-handling');


const createRoutes = app => {
  const baseUrl = '/api/messages';

  // Create
  app.post(baseUrl, (req, res, next) => {
    messagesRepo.create(req.body)
      .then(newMessage => {

        return res.json(newMessage);
      })
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // MongoDB Find()
  app.post(baseUrl +'/query', (req, res, next) => {
    messagesRepo.find(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Update
  app.put(baseUrl, (req, res, next) => {
    messagesRepo.update(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Delete
  app.delete(baseUrl, (req, res, next) => {
    messagesRepo.delete(req.body)
      .then(data => res.json(data))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });
};

module.exports = {
  createRoutes: createRoutes
}
