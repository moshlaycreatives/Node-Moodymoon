const labRouter = require("express").Router();
const {
  addLabReport,
  getAllReports,
  updateLabReport,
  deleteLabReport,
  getLabReportById,
} = require("../controllers/labReport");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

labRouter.post("/addLabReport", upload.any(), addLabReport);
labRouter.get("/getAllReports", getAllReports);
labRouter.patch("/updateLabReport/:reportId", updateLabReport);
labRouter.patch("/deleteLabReport/:reportId", deleteLabReport);
labRouter.get("/getLabReportById/:reportId", getLabReportById);

module.exports = labRouter;
