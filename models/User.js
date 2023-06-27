import mongoose from "mongoose";

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

// const User = mongoose.model("User", userSchema);

// export default User;
export default mongoose.model("User", userSchema);
