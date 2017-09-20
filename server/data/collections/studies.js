var mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema(
  {
    name: { type: String, unique: true, required: true },
    participants: { type: [Schema.Types.ObjectId], ref: "participants" },
    dateCreated: { type: Date, default: Date.now },
  }
);
