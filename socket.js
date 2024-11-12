const { Server } = require("socket.io");
const Chat = require("./models/chat");
const User = require("./models/user");
const Notification = require("./models/notification");
const sendEmail = require("./utills/sendEmail");
// const Notification = require("./models/notifications");
// const messageTemplate = require("./templates/message");

const { getConversation } = require("./controllers/chat");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  let users = [];

  const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId });
  };

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  const getUser = (userId) => {
    const user = users.find(
      (user) => user.userId.toString() === userId.toString()
    );
    return user;
  };

  io.on("connection", (socket) => {
    // console.log("Hey Boiii: ", socket);
    console.log("A user connected.");

    socket.on("addUser", async (userId, receiver) => {
      addUser(userId, socket.id);
      // console.log("hahahaha", userId);
      io.emit("getUsers", users);
      let conversationData = [];
      try {
        const conversation = await getConversation(userId, receiver);
        conversationData = conversation.data;
        // console.log(conversationData);

        socket.emit("userMsgs", conversationData);
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    });

    socket.on(
      "sendMessage",
      async ({ senderId, receiverId, text, createdAt }) => {
        // createdAt = new Date(createdAt);
        // console.log(senderId, receiverId, text, createdAt, imgUrl );
        // const reciever = await User.findOne({ _id: receiverId }).select(
        //   "_id email"
        // );
        // const sender = await User.findOne({ _id: senderId }).select(
        //   "_id email firstName role"
        // );
        let conversation = await Chat.findOne({
          $or: [
            { participants: [senderId, receiverId] },
            { participants: [receiverId, senderId] },
          ],
        });

        if (conversation) {
          conversation.messages.push({
            senderId,
            text,
            createdAt,
          });
        } else {
          conversation = new Chat({
            participants: [senderId, receiverId],
            messages: [
              {
                senderId,
                text,
                createdAt,
              },
            ],
          });
        }

        await conversation.save();

        const receiver = getUser(receiverId);

        if (receiver) {
          io.to(receiver.socketId).emit("getMessage", {
            senderId,
            text,
            createdAt,
          });
        } else {
          console.log("Receiver not found. Message stored in DB.");
        }
        const userFind = await User.findOne({ _id: senderId });
        const userFindAgain = await User.findOne({ _id: receiverId });
        await Notification.create({
          title: `${userFind.firstName}`,
          body: `${text}`,
          reciever: userFindAgain._id,
        });
      }
    );

    socket.on("disconnect", () => {
      console.log("A user disconnected!");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

module.exports = setupSocket;
