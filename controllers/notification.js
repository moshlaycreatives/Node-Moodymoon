const Notification = require("../models/notification");

exports.getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    const notification = await Notification.find({ reciever: userId });
    if (!notification) {
      return res
        .status(200)
        .json({ success: true, message: "No Notifications Available" });
    }
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
