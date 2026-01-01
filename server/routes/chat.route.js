import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { getOrCreateChat } from "../controllers/chat.contrtoller.js";

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, getOrCreateChat);

export default chatRouter;
