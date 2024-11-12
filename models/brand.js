const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
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
module.exports = mongoose.model("Brand", brandSchema);
