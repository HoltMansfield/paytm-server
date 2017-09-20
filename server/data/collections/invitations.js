const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "participants" },
    studyId: { type: Schema.Types.ObjectId, ref: "studies" },
  }
);
