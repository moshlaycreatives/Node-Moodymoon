const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    deliveryAddress: [
      {
        country: String,
        countryCode: String,
        address: String,
        apartment: String,
        city: String,
        state: String,
        zip: String,
        phone: String,
      },
    ],

    role: {
      type: String,
      trim: true,
      enum: ["admin", "user"],
      default: "user",
    },

    setNewPwd: { type: Boolean, default: false },
    forgotPasswordOtp: { type: String },
    forgotPasswordOtpExpire: {
      type: Date,
      default: "",
    },

    permanentDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    process.env.JWT_SECRET
    // {
    //   expiresIn: "3d",
    // }
  );
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  const isCorrect = await bcrypt.compare(candidatePassword, this.password);
  return isCorrect;
};

userSchema.methods.compareVerificationOtp = async function (verificationOtp) {
  const isMatch = await bcrypt.compare(verificationOtp, this.verificationOtp);
  return isMatch;
};
userSchema.methods.compareForgotPasswordOtp = async function (
  forgotPasswordOtp
) {
  const isMatch = await bcrypt.compare(
    forgotPasswordOtp,
    this.forgotPasswordOtp
  );
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
