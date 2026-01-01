import express from "express";
import { userAuth } from "../middlewares/auth.js";
import {
  getReceivedRequests,
  getConnections,
  getFeed,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, getReceivedRequests);
userRouter.get("/user/connections", userAuth, getConnections);
userRouter.get("/feed", userAuth, getFeed);

export default userRouter;
