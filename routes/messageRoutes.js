import express from "express";
import MessageController from "../controllers/MessageController.js";

const messageRouter = express.Router();

// Create a new message
messageRouter.post("/new", MessageController.createMessage);
//gets the conversation between the user and reciver
messageRouter.get("/getConvo", MessageController.getConversation);
messageRouter.get(
  "/test/:conversationId",
  MessageController.getMessagesByConversationId
);

// Other message-related routes can be added here

export default messageRouter;
