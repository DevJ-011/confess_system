const mongoose = require("mongoose");

const ConfessionSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    isPrivate: { type: Boolean, default: false }, // New field to determine visibility
  },
  { timestamps: true }
);

module.exports = mongoose.model("Confession", ConfessionSchema);
