const Cart = require("../models/cart");

exports.addToCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.body;
    console.log(req.body);
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const productIndex = cart.product.findIndex(
        (p) => p.productId.toString() === productId
      );

      if (productIndex > -1) {
        cart.product[productIndex].quantity += 1;
      } else {
        cart.product.push({ productId, quantity: 1 });
      }

      await cart.save();
    } else {
      cart = new Cart({
        userId,
        product: [{ productId, quantity: 1 }],
      });
      await cart.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Product added to cart" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId, status } = req.body;
    console.log(req.body);

    if (!productId || !status) {
      return res.status(400).json({
        success: false,
        message: "Product ID and status are required",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const productIndex = cart.product.findIndex(
        (p) => p.productId.toString() === productId
      );

      if (productIndex > -1) {
        if (status === "FULL") {
          cart.product.splice(productIndex, 1);
        } else if (status === "PARTIAL") {
          if (cart.product[productIndex].quantity > 1) {
            cart.product[productIndex].quantity -= 1;
          } else {
            cart.product.splice(productIndex, 1);
          }
        } else {
          return res
            .status(400)
            .json({ success: false, message: "Invalid status value" });
        }

        await cart.save();

        return res
          .status(200)
          .json({ success: true, message: "Product removed from cart" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Product not found in cart" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllUserCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const cart = await Cart.findOne({ userId }).populate("product.productId");
    if (!cart) {
      return res
        .status(400)
        .json({ success: false, message: "No Cart Available For This User" });
    }
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
