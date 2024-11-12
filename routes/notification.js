const notificationRouter = require("express").Router();
const { getAllNotifications } = require("../controllers/notification");
const auth = require("../middlewares/userAuth");

notificationRouter.get("/getAllNotifications", auth, getAllNotifications);

module.exports = notificationRouter;
