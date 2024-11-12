const User = require("../models/user");
const { validateEmail } = require("../utills/emailValidator");
const { validateRequiredFields } = require("../utills/validateRequiredFields");
const bcrypt = require("bcrypt");
const sendEmail = require("../utills/sendEmail");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dob, password } = req.body;
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "dob",
      "password",
    ];
    const missingFieldMessage = validateRequiredFields(
      requiredFields,
      req.body
    );
    if (missingFieldMessage) {
      return res.status(400).json({
        success: false,
        message: missingFieldMessage,
      });
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email is not valid" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User Already Exist With This Email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({
      email: email.toLowerCase(),
      phone,
      dob,
      password: hashedPassword,
      firstName,
      lastName,
    });
    return res
      .status(200)
      .json({ success: true, message: "User Registered Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Email & Password" });
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter a Valid Email" });
    }
    const user = await User.findOne({
      email: email.toLowerCase(),
      permanentDeleted: false,
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "No User With This Email" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password is wrong" });
    }

    const token = await user.createJWT();
    res.status(200).json({
      success: true,
      message: "Login Successfull",
      data: await User.findOne({
        email: email.toLowerCase(),
        permanentDeleted: false,
      }).select(
        "-password -setNewPwd -forgotPasswordOtp -forgotPasswordOtpExpire"
      ),
      token,
    });
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.forgetPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Email" });
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Valid Email" });
    }
    const checkEmail = await User.findOne({
      email: email.toLowerCase(),
      permanentDeleted: false,
    });
    if (!checkEmail) {
      return res
        .status(400)
        .json({ success: false, message: "No User With This Email" });
    }
    const forgotPasswordOtp = (
      Math.floor(Math.random() * 899999) + 100000
    ).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(forgotPasswordOtp, salt);
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        forgotPasswordOtp: hashedOTP,
        forgotPasswordOtpExpire: Date.now() + 5 * 60 * 1000,
      }
    );
    const mail = {
      to: email,
      subject: "Forget Password OTP",
      html: `Your OTP is ${forgotPasswordOtp}`,
    };
    sendEmail(mail);
    return res
      .status(200)
      .json({ success: true, message: "OTP Has been sent to your email" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, forgotPasswordOtp } = req.body;
    if (!email || !forgotPasswordOtp) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Email & OTP" });
    }
    const userCheck = await User.findOne({
      email: email.toLowerCase(),
      forgotPasswordOtpExpire: { $gt: Date.now() },
      permanentDeleted: false,
    });
    if (!userCheck) {
      return res
        .status(400)
        .json({ success: false, message: "Session Expired" });
    }
    const valid = await userCheck.compareForgotPasswordOtp(forgotPasswordOtp);

    if (valid) {
      await User.findOneAndUpdate(
        { email: email.toLowerCase(), permanentDeleted: false },

        {
          setNewPwd: true,
        }
      );
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    }
    return res.status(400).json({ message: "Invalid Otp" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Email" });
    }
    const oldUser = await User.findOne({
      email: email.toLowerCase(),
      permanentDeleted: false,
    });
    if (!oldUser?.setNewPwd) {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to do that operation",
      });
    }
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword, setNewPwd: false }
    );
    return res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const check = await User.findOne({
      email: email.toLowerCase(),
      permanentDeleted: false,
    });
    if (!check) {
      return res.status(400).json({ success: false, message: "Wrong email" });
    }

    const forgotPasswordOtp = (
      Math.floor(Math.random() * 899999) + 100000
    ).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(forgotPasswordOtp, salt);
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        forgotPasswordOtp: hashedOtp,
        forgotPasswordOtpExpire: Date.now() + 5 * 60 * 1000,
      }
    );
    const mail = {
      to: email,
      subject: "Forget Password OTP",
      html: `Your OTP is ${forgotPasswordOtp}`,
    };
    sendEmail(mail);
    return res.status(200).json({
      success: true,
      message: "OTP has sent to you",
    });
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { oldPassword, password, confirmPassword } = req.body;
    if (!oldPassword || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please Provide All Required Fields",
      });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Found" });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old Password is incorrect" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password & Confirm Password Are Not Same",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { _id: userId },
      {
        password: hashedPassword,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
