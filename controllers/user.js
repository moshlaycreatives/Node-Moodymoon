const User = require("../models/user");

exports.updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req.user;
    if (req.file) {
      const profilePicture = "/" + req.file.path;
      await User.findOneAndUpdate({ _id: userId }, { profilePicture });
      return res
        .status(200)
        .json({ success: true, message: "Profile Picture Updated" });
    }
    return res
      .status(400)
      .json({ success: false, message: "Please upload profile picture" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.addNewDeliveryAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    // console.log(userId);
    const { deliveryAddress } = req.body;
    // console.log(req.body);
    if (!deliveryAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Delivery Address" });
    }
    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { deliveryAddress } }
    );
    return res.status(200).json({
      success: true,
      message: "Delivery Address Added Successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, phone } = req.body;
    await User.findOneAndUpdate(
      { _id: userId },
      {
        firstName,
        lastName,
        phone,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId }).select(
      "-password -setNewPwd -forgotPasswordOtp -forgotPasswordOtpExpire "
    );
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "No User Available" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
