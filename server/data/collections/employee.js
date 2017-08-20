/* all the models in the collections folder get processed for registration by collection-manager.js */

const mongoose = require('mongoose');
const rek = require('rekuire');
const Schema = mongoose.Schema;
let isRegistered = mongoose.models.User; // if the model exists our flag initalizes true and the whole process is skipped
let schemaDefinition;


const register = function() {
  // check if our schema has already been registered
  if(!isRegistered) {

    // define schema
    schemaDefinition  = new Schema({
      dateCreated: { type: Date, default: Date.now },
      email: { type: String, required: true, unique: true },
      first: { type: String },
      last: { type: String },
      isAdmin: { type: Boolean },

      // the reviews for this employee
      reviews: { type: [Schema.ObjectId], ref: 'reviews' },
    });

    // register the schema with mongoose to 'create' a model
    mongoose.model('Employee', schemaDefinition);

    isRegistered = true; // run this once
  }

  return schemaDefinition;
};

module.exports.register = register;
