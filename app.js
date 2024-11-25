require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const connectDB = require("./db/db");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const https = require("https");
const fs = require("fs");
const authRouter = require("./routes/auth");
const catRouter = require("./routes/category");
const brandRouter = require("./routes/brand");
const contactRouter = require("./routes/contact");
const productRouter = require("./routes/product");
const labRouter = require("./routes/labReport");
const blogRouter = require("./routes/blog");
const userRouter = require("./routes/user");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const reviewRouter = require("./routes/review");
const notificationRouter = require("./routes/notification");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");
const adminRouter = require("./routes/adminDashboardData");
const setupSocket = require("./socket");

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send(
    "<h1 style='display: flex; justify-content: center;  align-items: center; height: 200px'>Welcome to Moody Moon Hemp Backend</h1>"
  );
});
app.use("/api/v1", authRouter);
app.use("/api/v1", catRouter);
app.use("/api/v1", brandRouter);
app.use("/api/v1", contactRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", labRouter);
app.use("/api/v1", blogRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1", chatRouter);
app.use("/api/v1", adminRouter);
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (error) {
    console.log(error);
  }
};
// const server = http.createServer(app);

const options = {
  key: fs.readFileSync("./privkey.pem"),
  cert: fs.readFileSync("./fullchain.pem"),
};
const server = https.createServer(options, app);
setupSocket(server);

server.listen(port, async () => {
  console.log(`Server is Listening At ${port}`);
  start();
});
