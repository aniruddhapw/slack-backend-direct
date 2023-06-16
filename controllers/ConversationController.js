import Conversation from "../models/Conversation.js";
import Joi from "joi";

const ConversationController = {
  createChannel: async (req, res) => {
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

      const savedChannel = await newChannel.save();

      res.status(201).send(savedChannel);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },

  getChannelList: async (req, res) => {
    try {
      const channels = await Conversation.find(
        { conversationType: "group" },
        "_id name"
      );

      const formattedChannels = channels.map((channelData) => ({
        id: channelData._id,
        name: channelData.name,
      }));

      res.status(200).send(formattedChannels);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },

  deleteConversation: async (req, res) => {
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
  },

  createDirectConversation: async (req, res) => {
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
  },
  // Other methods for the ConversationController can be added here
};

// Conversation validation schema

const newDirectConversationSchema = Joi.object({
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
});
const newChannelSchema = Joi.object({
  name: Joi.string().required(),
  members: Joi.array().items(Joi.string()),
  conversationType: Joi.string().valid("group", "direct").default("group"),
});

export default ConversationController;
