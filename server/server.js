import express from "express";
import "dotenv/config";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";

// utils
import "./utils/cronjob.js";
import initializeSocket from "./utils/socket.js";

// routes
import authRouter from "./routes/auth.route.js";
import profileRouter from "./routes/profile.route.js";
import requestRouter from "./routes/request.route.js";
import userRouter from "./routes/user.route.js";
import paymentRouter from "./routes/payment.route.js";
import chatRouter from "./routes/chat.route.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL||"http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(process.env.PORT, () => {
      console.log("Server is successfully listening on 8080...");
    });
  })
  .catch(() => {
    console.error("Database cannot be connected!!");
  });
