const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    message: { type: String, trim: true },
    permanentDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Contact", contactSchema);
