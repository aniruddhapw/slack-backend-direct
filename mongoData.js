// import mongoose from "mongoose";
// const slackSchema = mongoose.Schema({
//   userName: String,
//   channelName: String,
//   conversation: [
//     {
//       message: String,
//       timestamp: String,
//       user: String,
//       userImage: String,
//     },
//   ],
// });

// export default mongoose.model("conversations", slackSchema);

import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  id: String,
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
  message: String,
  timestamp: String,
  userImage: String,
});

const User = mongoose.model("User", userSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const DirectMessage = mongoose.model("DirectMessage", directMessageSchema);

export { User, Conversation, DirectMessage };
