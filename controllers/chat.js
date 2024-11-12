const Chat = require("../models/chat");

exports.getConversation = async (senderId, receiverId) => {
  const chat = await Chat.findOne({
    $or: [
      { participants: { $all: [senderId, receiverId] } },
      { participants: { $all: [receiverId, senderId] } },
    ],
  });

  return { data: chat };
};

exports.getAllConversations = async (req, res) => {
  try {
    // const { userId } = req.user;
    const chats = await Chat.find({
      permanentDeleted: false,
      // participants: userId,
    })
      .populate({
        path: "participants",
        select:
          "-forgotPasswordOtp -setNewPwd -password  -forgotPasswordOtpExpire ",
      })
      .sort({
        updatedAt: -1,
      });

    if (!chats || chats.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No Conversations" });
    }

    const conversationsWithLastMessage = chats.map((chat) => {
      const filteredParticipants = chat.participants.filter((participant) =>
        participant._id.toString()
      );

      const sortedMessages = chat.messages.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const lastMessage =
        sortedMessages.length > 0
          ? sortedMessages[sortedMessages.length - 1]
          : null;

      return {
        _id: chat._id,
        participants: filteredParticipants,
        messages: lastMessage || null,
      };
    });

    return res
      .status(200)
      .json({ success: true, data: conversationsWithLastMessage });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      permanentDeleted: false,
    })
      .populate({
        path: "participants",
        select:
          "-forgotPasswordOtp -setNewPwd -password  -forgotPasswordOtpExpire ",
      })
      .sort({
        updatedAt: -1,
      });

    if (!chats || chats.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No Conversations" });
    }

    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
