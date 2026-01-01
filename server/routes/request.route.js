import express from "express";
import { userAuth } from "../middlewares/auth.js";
import {
  sendRequest,
  reviewRequest,
} from "../controllers/request.controller.js";

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId", userAuth, sendRequest);
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  reviewRequest
);

export default requestRouter;
