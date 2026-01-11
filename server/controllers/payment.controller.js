import razorpayInstance from "../utils/razorpay.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import { membershipAmount } from "../utils/constant.js";
import {
  validateWebhookSignature,
} from "razorpay/dist/utils/razorpay-utils.js";

export const createPayment = async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    });

    const payment = await Payment.create({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    res.json({
      ...payment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const paymentWebhook = async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");

    const isValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.log("INvalid Webhook Signature");
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }
    
     console.log("Valid Webhook Signature");

    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findById(payment.userId);
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    res.status(200).json({ msg: "Webhook received successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const verifyPremium = async (req, res) => {

  // res.json(req.user.toJSON());

  const user = req.user.toJSON();
  console.log(user);
  if (user.isPremium) {
    return res.json({ ...user });
  }
  return res.json({ ...user });

};
