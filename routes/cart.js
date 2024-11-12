const cartRouter = require("express").Router();
const {
  addToCart,
  removeFromCart,
  getAllUserCart,
} = require("../controllers/cart");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

cartRouter.post("/addToCart", auth, addToCart);
cartRouter.post("/removeFromCart", auth, removeFromCart);
cartRouter.get("/getAllUserCart", auth, getAllUserCart);

module.exports = cartRouter;
