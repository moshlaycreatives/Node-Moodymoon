const paymentRouter = require("express").Router();
const { chargeAmount } = require("../controllers/payment");
const upload = require("../utills/upload");
const auth = require("../middlewares/userAuth");

paymentRouter.post("/chargeAmount", chargeAmount);

module.exports = paymentRouter;
