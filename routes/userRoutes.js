import express from "express";
import UserController from "../controllers/UserController.js";

const userRouter = express.Router();

// Create a new user
userRouter.post("/user", UserController.createUser);

// Get the list of users
userRouter.get("/userList", UserController.getUserList);

export default userRouter;
