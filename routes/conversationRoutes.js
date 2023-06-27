import express from "express";
import ConversationController from "../controllers/ConversationController.js";

const conversationRouter = express.Router();

// Create a new conversation channel
conversationRouter.post("/channel", ConversationController.createChannel);

// Get the list of conversation channels
conversationRouter.get("/channelList", ConversationController.getChannelList);

conversationRouter.post(
  "/direct/new",
  ConversationController.createDirectConversation
);
conversationRouter.delete(
  "/delete/:id",
  ConversationController.deleteConversation
);

export default conversationRouter;
