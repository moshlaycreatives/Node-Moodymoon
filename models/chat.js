const mongoose = require("mongoose");

const chatConversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
      imgUrl: String,
      createdAt: {
        type: String,
      },
    },
  ],
  permanentDeleted: {
    type: Boolean,
    default: false,
  },
});

const Chat = mongoose.model("Chat", chatConversationSchema);

module.exports = Chat;
