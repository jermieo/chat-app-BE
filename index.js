import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import connectDB from "./Database/Database.js";
import userRouter from "./Router/UserRouter.js";

const app = express();
dotenv.config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", userRouter); // Use userRouter for /api/auth route
app.use("/api/messages", userRouter); // Use userRouter for /api/messages route

const server = createServer(app);

server.listen(port, () => {
  console.log("App is listening on port", port);
});

const io = new SocketIO(server, {
  transports: ["websocket", "polling"],
  cors: {
    // origin: "http://localhost:4000",
    origin: "https://chat-app-rx.netlify.app",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
