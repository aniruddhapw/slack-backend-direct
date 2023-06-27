import Conversation from "../models/Conversation";

const ChannelController = {
  createChannel: async (req, res) => {
    try {
      const { name, members, conversationType } = req.body;

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
      res.status(200).send(channels);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },
};

export default ChannelController;
