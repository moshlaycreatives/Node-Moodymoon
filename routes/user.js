const userRouter = require("express").Router();
const {
  updateProfilePicture,
  addNewDeliveryAddress,
  updateProfile,
  getUserDetail,
} = require("../controllers/user");
const upload = require("../utills/upload");
const auth = require("../middlewares/userAuth");

userRouter.patch(
  "/updateProfilePicture",
  auth,
  upload.single("profilePicture"),
  updateProfilePicture
);
userRouter.patch("/addNewDeliveryAddress", auth, addNewDeliveryAddress);
userRouter.patch("/updateProfile", auth, updateProfile);
userRouter.get("/getUserDetail", auth, getUserDetail);

module.exports = userRouter;
