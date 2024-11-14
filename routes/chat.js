const chatRouter = require("express").Router();
const {
  getAllConversations,
  getAllChats,
  getAllChatsForUser,
} = require("../controllers/chat");
const auth = require("../middlewares/userAuth");

chatRouter.get("/getAllConversations", getAllConversations);
chatRouter.get("/getAllChats", getAllChats);
chatRouter.get("/getAllChatsForUser", auth, getAllChatsForUser);

module.exports = chatRouter;
