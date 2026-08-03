import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
  getOrCreateChat,
  uploadMedia,
  reactToMessage,
  deleteChatMessage,
} from "../controllers/chat.contrtoller.js";

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, getOrCreateChat);
chatRouter.post("/chat/upload", userAuth, upload.single("file"), uploadMedia);
chatRouter.post("/chat/react", userAuth, reactToMessage);
chatRouter.post("/chat/delete-message", userAuth, deleteChatMessage);

export default chatRouter;
