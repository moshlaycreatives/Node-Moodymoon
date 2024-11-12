const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema(
  {
    image: String,
    labTestName: { type: String, trim: true },
    labTest: { type: String, trim: true },
    permanentDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("LabReport", labReportSchema);
