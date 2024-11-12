const contactRouter = require("express").Router();
const {
  createContact,
  getAllContacts,
  getSingleContact,
  deleteContact,
} = require("../controllers/contact");
const auth = require("../middlewares/userAuth");

contactRouter.post("/createContact", createContact);
contactRouter.get("/getAllContacts", getAllContacts);
contactRouter.get("/getSingleContact/:contactId", getSingleContact);
contactRouter.patch("/deleteContact/:contactId", deleteContact);

module.exports = contactRouter;
