import Conversation from "../models/Conversation.js";
import DirectMessage from "../models/DirectMessage.js";

const MessageController = {
  createMessage: async (req, res) => {
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
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },

  getConversation: async (req, res) => {
    try {
      const { id, userId } = req.query;

      const conversation = await Conversation.findById(id)
        .populate("members", "username email")
        .populate({
          path: "messages",
          populate: {
            path: "sender",
            model: "User",
            select: "username email",
          },
        })
        .exec();

      if (!conversation) {
        return res.status(404).send(`Conversation with id ${id} not found`);
      } else if (
        conversation.conversationType === "direct" &&
        !conversation.members.includes(userId)
      ) {
        return res
          .status(401)
          .send(`User with id ${userId} is not a member of the conversation`);
      }

      res.status(200).send(conversation);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },
  getMessagesByConversationId: async (req, res) => {
    try {
      const { conversationId } = req.params;

      const messages = await DirectMessage.find({ conversationId });

      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // Other methods for the MessageController can be added here
};

export default MessageController;
