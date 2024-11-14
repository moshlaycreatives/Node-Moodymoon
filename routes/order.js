const orderRouter = require("express").Router();
const {
  createOrder,
  getOrderHistory,
  getAllOrders,
  getAllCustomers,
  changeOrderStatus,
  getOrderById,
  deleteOrder,
  cancelOrder,
} = require("../controllers/order");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

orderRouter.post("/createOrder", auth, createOrder);
orderRouter.get("/getOrderHistory", auth, getOrderHistory);
orderRouter.get("/getAllOrders", getAllOrders);
orderRouter.get("/getAllCustomers", getAllCustomers);
orderRouter.patch("/changeOrderStatus/:orderId", changeOrderStatus);
orderRouter.patch("/deleteOrder/:orderId", deleteOrder);
orderRouter.patch("/cancelOrder/:orderId", auth, cancelOrder);
orderRouter.get("/getOrderById/:orderId", getOrderById);

module.exports = orderRouter;
