var mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "participants" },
    dateCreated: { type: Date, default: Date.now },
  }
);
