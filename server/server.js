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

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.some((allowed) => {
        const cleanAllowed = allowed.replace(/\/$/, "");
        return cleanAllowed === "*" || cleanAllowed === cleanOrigin;
      });
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to avoid strict CORS block
    },
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
      console.log("Server is successfully listening on ...");
    });
  })
  .catch(() => {
    console.error("Database cannot be connected!!");
  });
