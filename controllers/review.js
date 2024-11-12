const Review = require("../models/review");
const { validateEmail } = require("../utills/emailValidator");
const { validateRequiredFields } = require("../utills/validateRequiredFields");

exports.addReview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.params;
    const { rating, name, email, feedback } = req.body;
    const requiredFields = ["rating", "name", "email", "feedback"];
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
    await Review.create({ userId, productId, rating, name, email, feedback });
    return res
      .status(200)
      .json({ success: true, message: "Review Added Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllPendingReviews = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({});
    const newReviews = await Review.countDocuments({ status: "pending" });
    const reviews = await Review.find({ status: "pending" })
      .populate("userId", "firstName lastName email profilePicture")
      .populate("productId");
    const allReviews = await Review.find({})
      .populate("userId", "firstName lastName email profilePicture")
      .populate("productId");
    const sumOfRatings = allReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const average = (sumOfRatings / totalReviews).toFixed(2);
    const ONE = await Review.countDocuments({ rating: 1 });
    const TWO = await Review.countDocuments({ rating: 2 });
    const THREE = await Review.countDocuments({ rating: 3 });
    const FOUR = await Review.countDocuments({ rating: 4 });
    const FIVE = await Review.countDocuments({ rating: 5 });

    return res.status(200).json({
      success: true,
      data: reviews,
      totalReviews,
      newReviews,
      average,
      ONE,
      TWO,
      THREE,
      FOUR,
      FIVE,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.changeReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Status" });
    }
    await Review.findOneAndUpdate({ _id: reviewId }, { status });
    return res
      .status(200)
      .json({ success: true, message: "Review Status Updated Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, status: "approved" })
      .populate("userId", "firstName lastName email profilePicture")
      .populate("productId");

    const total = reviews.length;

    if (total === 0) {
      return res.status(200).json({
        success: true,
        message: "No Approved Reviews For This Product",
        total,
        average: 0,
      });
    }

    const sumOfRatings = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const average = (sumOfRatings / total).toFixed(2);

    return res.status(200).json({
      success: true,
      data: reviews,
      total,
      average,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
