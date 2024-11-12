const LabReport = require("../models/labReport");

exports.addLabReport = async (req, res) => {
  try {
    const { labTestName } = req.body;
    // console.log(req.files);
    if (!labTestName) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Lab Test Report Name" });
    }
    if (req.files) {
      const img = req.files.filter((file) => file.fieldname === "image");
      // console.log(img);
      const lab = req.files.filter((file) => file.fieldname === "labreport");
      await LabReport.create({
        labTestName,
        image: "/" + img[0].path,
        labTest: "/" + lab[0].path,
      });
      return res
        .status(200)
        .json({ success: true, message: "Lab Report Added" });
    }
    return res
      .status(400)
      .json({ success: false, message: "Image & Report are compulsory" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await LabReport.find({ permanentDeleted: false });
    if (!reports) {
      return res
        .status(200)
        .json({ success: true, message: "No Reports Available Yet" });
    }
    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateLabReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { labTestName } = req.body;
    if (req.files) {
      const img = req.files.filter((file) => file.fieldname === "image");
      // console.log(img);
      const lab = req.files.filter((file) => file.fieldname === "labreport");
      await LabReport.findOneAndUpdate(
        { _id: reportId },
        {
          labTestName,
          image: "/" + img[0]?.path,
          labTest: "/" + lab[0]?.path,
        }
      );
    }
    await LabReport.findOneAndUpdate(
      { _id: reportId },
      {
        labTestName,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Lab Report Updated Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.deleteLabReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    await LabReport.findOneAndUpdate(
      { _id: reportId },
      {
        permanentDeleted: true,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Lab Report Deleted Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.getLabReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    let report = await LabReport.findOne({ _id: reportId });
    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
