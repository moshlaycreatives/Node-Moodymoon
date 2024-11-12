const reviewRouter = require("express").Router();
const {
  getAllPendingReviews,
  addReview,
  changeReviewStatus,
  getAllReviewsForProduct,
} = require("../controllers/review");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

reviewRouter.post("/addReview/:productId", auth, addReview);
reviewRouter.get("/getAllPendingReviews", getAllPendingReviews);
reviewRouter.get(
  "/getAllReviewsForProduct/:productId",
  getAllReviewsForProduct
);
reviewRouter.patch("/changeReviewStatus/:reviewId", changeReviewStatus);

module.exports = reviewRouter;
