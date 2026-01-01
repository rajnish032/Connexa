import express from "express";
import { userAuth } from "../middlewares/auth.js";
import {
  viewProfile,
  editProfile,
} from "../controllers/profile.controller.js";

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, viewProfile);
profileRouter.patch("/profile/edit", userAuth, editProfile);

export default profileRouter;
