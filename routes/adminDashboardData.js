const adminRouter = require("express").Router();
const {
  getSalesDetails,
  getOverviewDetails,
} = require("../controllers/adminDashboardData");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

adminRouter.post("/getSalesDetails", getSalesDetails);
adminRouter.get("/getOverviewDetails", getOverviewDetails);

module.exports = adminRouter;
