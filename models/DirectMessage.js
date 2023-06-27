import mongoose from "mongoose";

const directMessageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  conversationId: String,
  username: String,
  message: {
    type: String,
    required: true,
    trim: true,
    set: function (value) {
      // Remove internal extra spaces
      return value.replace(/\s+/g, " ");
    },
  },
  timestamp: {
    type: String,
    required: true,
  },
  userImage: String,
});

const DirectMessage = mongoose.model("DirectMessage", directMessageSchema);

export default DirectMessage;
