const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema(
  {
    dateCreated: { type: Date, default: Date.now },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String },
    first: { type: String },
    last: { type: String }
  }
);
