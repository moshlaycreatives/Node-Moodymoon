const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    images: [String],
    productName: {
      type: String,
      trim: true,
    },

    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    strength: {
      type: String,
      trim: true,
    },

    quantityPerPack: {
      type: Number,
      trim: true,
    },

    stock: {
      type: Number,
      trim: true,
    },

    price: {
      type: Number,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    flavor: {
      type: String,
      trim: true,
    },

    offer: [
      {
        pack: Number,
        percent: Number,
      },
    ],

    permanentDeleted: {
      type: Boolean,
      default: false,
    },

    best: {
      type: Boolean,
      default: false,
    },

    labTestName: {
      type: String,
      trim: true,
    },

    labTest: String,

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Product", productSchema);
