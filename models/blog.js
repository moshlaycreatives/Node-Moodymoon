const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    image: String,
    title: { type: String, trim: true },
    author: { type: String, trim: true },
    tags: [String],
    details: String,
    permanentDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Blog", blogSchema);
