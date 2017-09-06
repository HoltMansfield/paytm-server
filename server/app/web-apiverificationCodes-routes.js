var verificationCodesApi = rek('verificationCodes-api');


var addRoutes = function(app) {

  app.router.get('/api/verificationCodes/:id', function(req, res, next) {
    verificationCodesApi.get(req.params.id)
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      return next(err);
    });
  });

  app.router.put('/api/verificationCodes/:id', function(req, res, next) {
    verificationCodesApi.put(req.params.id, req.body)
      .then(function(data) {
        res.json(data);
      })
      .catch(function(err) {
        return next(err);
      });
  });

  app.router.post('/api/verificationCodes/', function(req, res, next) {
    verificationCodesApi.post(req.body)
      .then(function(data) {
        res.json(data);
      })
      .catch(function(err) {
        return next(err);
      });
  });

  app.router.post('/api/verificationCodes/query', function(req, res, next) {
    verificationCodesApi.query(req.body)
      .then(function(data) {
        res.json(data);
      })
      .catch(function(err) {
        return next(err);
      });
  });

  app.router.delete('/api/verificationCodes/:id', function(req, res, next) {
    verificationCodesApi.delete(req.params.id, req.body)
      .then(function(data) {
        res.json(data);
      })
      .catch(function(err) {
        return next(err);
      });
  });

  return app;
};

module.exports = addRoutes;
