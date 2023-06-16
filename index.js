import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import conversationRouter from "./routes/conversationRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import Pusher from "pusher";
import userRouter from "./routes/userRoutes.js";
import * as dotenv from "dotenv";
import Conversation from "./models/Conversation.js";
import User from "./models/User.js";
import DirectMessage from "./models/DirectMessage.js";
dotenv.config();

const app = express();
const port = 9000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.mongo_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const pusher = new Pusher({
  appId: process.env.appId,
  key: process.env.key,
  secret: process.env.secret,
  cluster: "ap2",
  useTLS: true,
});
mongoose.connection.once("open", () => {
  console.log("DB connected");

  Conversation.watch().on("change", (change) => {
    if (change.operationType === "insert") {
      console.log("conversation invoke");
      const conversation = change.fullDocument;
      pusher.trigger("conversations", "newConversation", {
        conversation: conversation,
      });
    }
  });

  User.watch().on("change", (change) => {
    if (change.operationType === "insert") {
      console.log("user invoke");
      const user = change.fullDocument;
      pusher.trigger("users", "newUser", {
        user: user,
      });
    }
  });

  DirectMessage.watch().on("change", (change) => {
    if (change.operationType === "insert") {
      console.log("message invoke");
      const message = change.fullDocument;
      console.log(message);
      const conversationId = message.conversationId;
      pusher.trigger(`conversation-${conversationId}`, "newMessage", {
        message: message,
      });
    }
  });

  // Start the server after successful database connection
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

// Register conversation routes
app.use("/conversations", conversationRouter);

// Register message routes
app.use("/messages", messageRouter);

// Register user routes
app.use("/users", userRouter);

// Other middleware and configurations can be added here

app.get("/", (req, res) => res.status(200).send("Hello, world!"));
