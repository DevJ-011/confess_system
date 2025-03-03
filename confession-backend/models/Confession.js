const mongoose = require("mongoose");

const ConfessionSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    comments: [
      {
        text: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Store user ID
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Confession", ConfessionSchema);
