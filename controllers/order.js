const { validateEmail } = require("../utills/emailValidator");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const Notification = require("../models/notification");
const { validateRequiredFields } = require("../utills/validateRequiredFields");
exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);

    const {
      country,
      state,
      zip,
      email,
      phone,
      product,
      firstName,
      lastName,
      address,
      city,
      appartment,
      subtotal,
      shippingFee,
      total,
    } = req.body;

    const requiredFields = [
      "country",
      "state",
      "zip",
      "email",
      "phone",
      "product",
      "firstName",
      "lastName",
      "address",
      "city",
      "appartment",
      "subtotal",
      "shippingFee",
      "total",
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

    for (const productId of product) {
      const productData = await Product.findById(productId);
      if (productData && productData.stock > 0) {
        productData.stock -= 1;
        await productData.save();
      } else {
        return res.status(400).json({
          success: false,
          message: `Product ${productData.productName} is out of stock`,
        });
      }
    }

    await Order.create({
      country,
      state,
      zip,
      email,
      phone,
      product,
      firstName,
      lastName,
      address,
      city,
      appartment,
      subtotal,
      shippingFee,
      total,
      customer: userId,
    });

    const admin = await User.findOne({ role: "admin" });

    await Notification.create({
      title: `${user.firstName} placed an order for ${product.length} item(s)`,
      body: "New Order",
      reciever: admin._id,
    });

    return res
      .status(200)
      .json({ success: true, message: "Order Details Saved" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const orders = await Order.find({ customer: userId })
      .populate("product")
      .sort({
        createdAt: -1,
      });
    if (!orders) {
      return res
        .status(200)
        .json({ success: true, message: "You Have Order Nothing Yet" });
    }
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ permanentDeleted: false })
      .populate("product")
      .sort({
        createdAt: -1,
      });
    if (!orders) {
      return res
        .status(200)
        .json({ success: true, message: "No Orders Available" });
    }
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId })
      .populate("product")
      .sort({
        createdAt: -1,
      });
    if (!order) {
      return res
        .status(200)
        .json({ success: true, message: "You Have Ordered Nothing Yet" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Status" });
    }
    await Order.findOneAndUpdate({ _id: orderId }, { status });
    return res
      .status(200)
      .json({ success: true, message: "Order Status Changed" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    await Order.findOneAndUpdate({ _id: orderId }, { permanentDeleted: true });
    return res.status(200).json({ success: true, message: "Order Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { permanentDeleted: false } },
      {
        $group: {
          _id: "$customer",
          orderCount: { $sum: 1 },
          orders: { $push: "$$ROOT" },
          totalPurchase: { $sum: "$total" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customerDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                deliveryAddress: 1,
                phone: 1,
                profilePicture: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$customerDetails" },
      {
        $project: {
          _id: 0,
          customer: "$customerDetails",
          orderCount: 1,
          orders: 1,
          totalPurchase: 1,
        },
      },
      { $sort: { "customer.createdAt": -1 } },
    ]);

    if (!orders || orders.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No orders found" });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { orderId } = req.params;
    // const { status } = req.body;
    // if (!status) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Please Provide Status" });
    // }
    const cancel = await Order.findOneAndUpdate(
      { _id: orderId, customer: userId },
      { status: "cancelled" }
    );
    return res
      .status(200)
      .json({ success: true, message: "Order Cancelled Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
