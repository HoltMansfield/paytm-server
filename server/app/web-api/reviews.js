const rek = require('rekuire');

const reviewApi = rek('review-repo');
const errorHandling = rek('error-handling');
const baseUrl = '/api/reviews';

const createRoutes = app => {
  // Create
  app.post(baseUrl, (req, res, next) => {
    reviewApi.create(req.body)
      .then(newReview => res.json(newReview))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Update
  app.put(baseUrl, (req, res, next) => {
    reviewApi.update(req.body)
      .then(reviewFromDb => res.json(reviewFromDb))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Find
  app.post(baseUrl +'/query', (req, res, next) => {
    reviewApi.find(req.body)
      .then(results => res.json(results))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });

  // Delete
  app.delete(baseUrl +'/query', (req, res, next) => {
    reviewApi.deleteDocument(req.body)
      .then(results => res.json(results))
      .catch((err) => errorHandling.requestErrorHandler(err, req, res));
  });
};

module.exports = {
  createRoutes: createRoutes
}
