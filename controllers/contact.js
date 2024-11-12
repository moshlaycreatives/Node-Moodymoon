const Contact = require("../models/contact");
const { validateRequiredFields } = require("../utills/validateRequiredFields");

exports.createContact = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    const requiredFields = ["name", "email", "message"];
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
    await Contact.create({ name, phone, email, message });
    return res
      .status(200)
      .json({ success: true, message: "Message Sent To Admin" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contact = await Contact.find({ permanentDeleted: false }).sort({
      createdAt: -1,
    });
    if (!contact) {
      return res
        .status(200)
        .json({ success: true, message: "No Data Available" });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.getSingleContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findOne({ _id: contactId });
    if (!contact) {
      return res
        .status(200)
        .json({ success: true, message: "No Data Available" });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findOneAndUpdate(
      { _id: contactId },
      { permanentDeleted: true }
    );
    if (!contact) {
      return res
        .status(200)
        .json({ success: true, message: "No Data Available" });
    }
    return res.status(200).json({ success: true, message: "Contact Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
