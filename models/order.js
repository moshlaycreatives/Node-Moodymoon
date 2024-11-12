const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    country: { type: String, trim: true },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    address: { type: String, trim: true },
    appartment: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    status: {
      type: String,
      trim: true,
      default: "pending",
      enum: ["pending", "shipped", "done", "cancelled"],
    },
    subtotal: { type: Number, trim: true },
    shippingFee: { type: Number, trim: true },
    total: { type: Number, trim: true },

    permanentDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Order", orderSchema);
