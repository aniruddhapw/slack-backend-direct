import mongoose from "mongoose";

// const userSchema = mongoose.Schema({
//   username: String,
//   email: String,
//   id: String,
//   userImage: String,
// });
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
  },
  userImage: String,
});

const conversationSchema = mongoose.Schema({
  name: String,
  // members: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  // ],
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

const User = mongoose.model("User", userSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const DirectMessage = mongoose.model("DirectMessage", directMessageSchema);

export { User, Conversation, DirectMessage };
