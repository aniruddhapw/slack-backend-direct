import User from "../models/User.js";

const UserController = {
  createUser: async (req, res) => {
    try {
      const dbData = req.body;

      // Check if user with email already exists
      const existingUser = await User.findOne({ email: dbData.email });
      if (existingUser) {
        return res.status(200).send(existingUser);
      }

      // Create new user
      const newUser = await User.create(dbData);
      res.status(201).send(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },

  getUserList: async (req, res) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { userId, isOnline, lastSeen } = req.body;
      const updatedUser = await User.findByIdAndUpdate(userId, {
        isOnline,
        lastSeen,
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

};

export default UserController;
