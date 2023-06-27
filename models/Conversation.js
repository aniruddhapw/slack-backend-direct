import mongoose from "mongoose";

const conversationSchema = mongoose.Schema({
  name: String,
  members: [String],
  conversationType: {
    type: String,
    enum: ["group", "direct"],
    default: "group",
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DirectMessage",
    },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
