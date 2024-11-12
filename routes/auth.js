const authRouter = require("express").Router();
const {
  register,
  login,
  forgetPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
  resendOtp,
  changePassword,
} = require("../controllers/auth");
const auth = require("../middlewares/userAuth");

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgetPasswordOTP", forgetPasswordOTP);
authRouter.post("/verifyForgotPasswordOTP", verifyForgotPasswordOTP);
authRouter.post("/resetPassword", resetPassword);
authRouter.post("/resendOtp", resendOtp);
authRouter.post("/changePassword", auth, changePassword);

module.exports = authRouter;
