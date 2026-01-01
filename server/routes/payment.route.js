import express from "express";
import { userAuth } from "../middlewares/auth.js";
import {
  createPayment,
  paymentWebhook,
  verifyPremium,
} from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/payment/create", userAuth, createPayment);
paymentRouter.post("/payment/webhook", paymentWebhook);
paymentRouter.get("/premium/verify", userAuth, verifyPremium);

export default paymentRouter;
