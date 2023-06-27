import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Pusher from "pusher";
import Joi from "joi";

// import { Conversation, User, DirectMessage } from "./mongoData.js";
import User from "./models/User.js";
import Conversation from "./models/Conversation.js";
import DirectMessage from "./models/DirectMessage.js";

import * as dotenv from "dotenv";
dotenv.config();
const ports = process.env.PORT;
console.log(ports);
//app config
const app = express();
const port = 9000;
const pusher = new Pusher({
  appId: process.env.appId,
  key: process.env.key,
  secret: process.env.secret,
  cluster: "ap2",
  useTLS: true,
});
//middlewares
app.use(cors());
app.use(express.json());

//db config

const mongoURI = process.env.mongo_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
      console.log("message invoke  ");
      const message = change.fullDocument;
      console.log(message);
      const conversationId = message.conversationId;
      pusher.trigger(`conversation-${conversationId}`, "newMessage", {
        message: message,
      });
    }
  });
});

//api routes
app.get("/", (req, res) => res.status(200).send("hello guyssss"));

app.post("/new/user", async (req, res) => {
  const dbData = req.body;

  // Check if user with email already exists
  const existingUser = await User.findOne({ email: dbData.email });
  if (existingUser) {
    return res.status(200).send(existingUser);
  }

  // Create new user
  User.create(dbData)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
//creates new channel
const newChannelSchema = Joi.object({
  name: Joi.string().required(),

  conversationType: Joi.string().valid("group", "direct").default("group"),
});

app.post("/new/channel", (req, res) => {
  try {
    const { error, value } = newChannelSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const { name, members, conversationType } = value;
    const newChannel = new Conversation({
      name,
      members,
      conversationType,
      messages: [],
    });

    newChannel
      .save()
      .then((data) => {
        res.status(201).send(data);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

//creates new message
app.post("/new/message", async (req, res) => {
  try {
    const conversationId = req.query.id;
    const newMessage = req.body;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).send("Conversation not found");
    }

    const message = new DirectMessage(newMessage);
    conversation.messages.push(message);
    await message.save();
    await conversation.save();

    res.status(201).send(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.post("/channels/new", (req, res) => {
  const channelData = req.body;
  const newChannel = new Conversation({
    name: channelData.name,
    members: channelData.members,
    conversationType: "group",
    messages: [],
  });
  newChannel
    .save()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
//returns the channel list
app.get("/get/channelList", (req, res) => {
  Conversation.find({ conversationType: "group" }, "_id name")
    .then((data) => {
      const channels = data.map((channelData) => ({
        id: channelData._id,
        name: channelData.name,
      }));
      res.status(200).send(channels);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
//returns the whole conversation by id if userId is in the list of members of the conversation
const getConversationSchema = Joi.object({
  id: Joi.string().required(),
  userId: Joi.string().required(),
});

app.get("/get/conversation", (req, res) => {
  const { error, value } = getConversationSchema.validate(req.query);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { id, userId } = value;

  Conversation.findById(id)
    .populate("members", "username email")
    .populate({
      path: "messages",
      populate: {
        path: "sender",
        model: "User",
        select: "username email",
      },
    })
    .exec()
    .then((conversation) => {
      if (!conversation) {
        res.status(404).send(`Conversation with id ${id} not found`);
      } else if (
        conversation.conversationType === "direct" &&
        !conversation.members.includes(userId)
      ) {
        res
          .status(401)
          .send(`User with id ${userId} is not a member of the conversation`);
      } else {
        res.status(200).send(conversation);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

// returns user list
app.get("/get/userList", (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
});
//creates new direct conversation with members as sender and reciver
const newDirectConversationSchema = Joi.object({
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
});

app.post("/direct/new", async (req, res) => {
  try {
    const { error, value } = newDirectConversationSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const { sender, receiver } = value;

    // Check if there is an existing conversation between the sender and receiver
    const existingConversation = await Conversation.findOne({
      conversationType: "direct",
      members: { $all: [sender, receiver] },
    });

    if (existingConversation) {
      return res.status(200).send(existingConversation);
    }

    const newConversation = new Conversation({
      conversationType: "direct",
      members: [sender, receiver],
    });

    const conversation = await newConversation.save();

    res.status(201).send(conversation);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.delete("/conversations/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find and remove the conversation
    const deletedConversation = await Conversation.findByIdAndDelete(id);

    if (!deletedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

//listen
app.listen(port, () => console.log(`listening on localhost :${port}`));
export default app;
