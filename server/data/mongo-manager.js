const Promise = require('bluebird');
const rek = require('rekuire');
const config = require('config');
const mongoose = require('mongoose');

const collections = rek('collection-manager');

const initialize = function(app) {
  // make a synchronous call to import mongo models
  collections.importCollections();

  // use bluebird for Promises
  mongoose.Promise = Promise;

  return mongoose.connect(config.mongo.connection, { useMongoClient: true })
    .then(() => Promise.resolve(app));
};

const connect = function(app) {
    if(mongoose.connection.readyState) {
      // we are already connected
      Promise.resolve(app);
    } else {
      return initialize(app);
    }
};

const disconnect = function() {
  return new Promise((resolve, reject) => {
    mongoose.disconnect(() => {
      resolve(true);
    });
  });
};

module.exports = {
  connect: connect,
  disconnect: disconnect
};
