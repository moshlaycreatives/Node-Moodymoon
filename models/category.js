const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    image: String,
    name: { type: String, trim: true },
    permanentDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Category", categorySchema);
