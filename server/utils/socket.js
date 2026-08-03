import { Server } from "socket.io";
import crypto from "crypto";
import Chat from "../models/chat.js";
import User from "../models/user.js";
import { deleteFromCloudinary } from "./cloudinary.js";

const cleanId = (id) => {
  if (!id) return "";
  if (typeof id === "object") {
    if (id._id) return String(id._id);
    if (id.userId) return String(id.userId);
    if (id.targetUserId) return String(id.targetUserId);
  }
  return String(id);
};

const getSecretRoomId = (userId, targetUserId) => {
  const uid1 = cleanId(userId);
  const uid2 = cleanId(targetUserId);
  return crypto
    .createHash("sha256")
    .update([uid1, uid2].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    "http://localhost:5173",
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
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
        return callback(null, true); // Fallback
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", async ({ firstName, userId, targetUserId }) => {
      const uid = cleanId(userId);
      const targetId = cleanId(targetUserId);
      const roomId = getSecretRoomId(uid, targetId);

      socket.join(roomId);
      if (uid) {
        socket.join(`user_${uid}`);
      }

      // Auto-mark unread incoming messages as seen when joining chat
      try {
        const chat = await Chat.findOne({
          participants: { $all: [uid, targetId] },
        });

        if (chat) {
          let updated = false;
          chat.messages.forEach((msg) => {
            if (msg.senderId.toString() !== uid && msg.status !== "seen") {
              msg.status = "seen";
              updated = true;
            }
          });

          if (updated) {
            await chat.save();
            io.to(roomId).emit("messagesSeen", {
              targetUserId: uid,
            });
          }
        }
      } catch (err) {
        console.error("Error auto-marking messages as seen:", err);
      }
    });

    socket.on("joinUser", ({ userId }) => {
      const uid = cleanId(userId);
      if (uid) {
        socket.join(`user_${uid}`);
      }
    });

    socket.on(
      "sendMessage",
      async ({
        firstName,
        lastName,
        photoUrl,
        userId,
        targetUserId,
        text,
        mediaUrl,
        mediaType,
        fileName,
        replyTo,
      }) => {
        try {
          const uid = cleanId(userId);
          const targetId = cleanId(targetUserId);
          const roomId = getSecretRoomId(uid, targetId);
          const roomSockets = io.sockets.adapter.rooms.get(roomId);

          let initialStatus = "sent";
          if (roomSockets && roomSockets.size > 1) {
            initialStatus = "seen";
          } else {
            initialStatus = "delivered";
          }

          let chat = await Chat.findOne({
            participants: { $all: [uid, targetId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [uid, targetId],
              messages: [],
            });
          }

          const newMessage = {
            senderId: uid,
            text: text || "",
            mediaUrl: mediaUrl || null,
            mediaType: mediaType || null,
            fileName: fileName || null,
            replyTo: replyTo || null,
            reactions: [],
            status: initialStatus,
            isDeleted: false,
          };

          chat.messages.push(newMessage);
          await chat.save();

          const createdMessage = chat.messages[chat.messages.length - 1];

          io.to(roomId).emit("messageReceived", {
            _id: createdMessage._id,
            senderId: uid,
            firstName,
            lastName,
            photoUrl,
            text: createdMessage.text,
            mediaUrl: createdMessage.mediaUrl,
            mediaType: createdMessage.mediaType,
            fileName: createdMessage.fileName,
            replyTo: createdMessage.replyTo,
            reactions: [],
            status: createdMessage.status,
            isDeleted: false,
            createdAt: createdMessage.createdAt,
          });

          // Emit real-time notification to target user
          io.to(`user_${targetId}`).emit("newNotification", {
            type: "chat",
            title: "New Message",
            message: text ? (text.length > 35 ? text.substring(0, 35) + "..." : text) : `Sent an attachment [${mediaType || "media"}]`,
            senderName: `${firstName || "User"} ${lastName || ""}`.trim(),
            senderPhoto: photoUrl,
            link: `/chat/${uid}`,
          });
        } catch (err) {
          console.error("Error sending message via socket:", err);
        }
      }
    );

    socket.on("markAsSeen", async ({ userId, targetUserId }) => {
      try {
        const uid = cleanId(userId);
        const targetId = cleanId(targetUserId);
        const roomId = getSecretRoomId(uid, targetId);
        const chat = await Chat.findOne({
          participants: { $all: [uid, targetId] },
        });

        if (!chat) return;

        let updated = false;
        chat.messages.forEach((msg) => {
          if (msg.senderId.toString() !== uid && msg.status !== "seen") {
            msg.status = "seen";
            updated = true;
          }
        });

        if (updated) {
          await chat.save();
          io.to(roomId).emit("messagesSeen", {
            targetUserId: uid,
          });
        }
      } catch (err) {
        console.error("Error marking messages as seen via socket:", err);
      }
    });

    socket.on(
      "reactMessage",
      async ({ userId, targetUserId, messageId, emoji }) => {
        try {
          const uid = cleanId(userId);
          const targetId = cleanId(targetUserId);
          const roomId = getSecretRoomId(uid, targetId);
          const chat = await Chat.findOne({
            participants: { $all: [uid, targetId] },
          });

          if (!chat) return;
          const message = chat.messages.id(messageId);
          if (!message) return;

          const existingIndex = message.reactions.findIndex(
            (r) => r.userId.toString() === uid
          );

          if (existingIndex > -1) {
            if (message.reactions[existingIndex].emoji === emoji) {
              message.reactions.splice(existingIndex, 1);
            } else {
              message.reactions[existingIndex].emoji = emoji;
            }
          } else {
            message.reactions.push({ userId: uid, emoji });
          }

          await chat.save();

          io.to(roomId).emit("messageReacted", {
            messageId,
            reactions: message.reactions,
          });
        } catch (err) {
          console.error("Error reacting to message via socket:", err);
        }
      }
    );

    socket.on(
      "deleteMessage",
      async ({ userId, targetUserId, messageId }) => {
        try {
          const uid = cleanId(userId);
          const targetId = cleanId(targetUserId);
          const roomId = getSecretRoomId(uid, targetId);
          const chat = await Chat.findOne({
            participants: { $all: [uid, targetId] },
          });

          if (!chat) return;
          const message = chat.messages.id(messageId);
          if (!message) return;

          if (message.mediaUrl || message.publicId) {
            await deleteFromCloudinary(message.publicId || message.mediaUrl, message.mediaType);
          }

          message.isDeleted = true;
          message.text = "This message was deleted";
          message.mediaUrl = null;
          message.mediaType = null;
          message.publicId = null;

          await chat.save();

          io.to(roomId).emit("messageDeleted", {
            messageId,
          });
        } catch (err) {
          console.error("Error deleting message via socket:", err);
        }
      }
    );

    // --- WEBRTC GLOBAL CALL SIGNALING EVENTS ---
    socket.on("callUser", ({ userToCall, signalData, from, name, callType }) => {
      const targetId = cleanId(userToCall);
      const senderId = cleanId(from);
      const roomId = getSecretRoomId(senderId, targetId);

      const payload = {
        signal: signalData,
        from: senderId,
        name,
        callType,
      };

      io.to(`user_${targetId}`).emit("incomingCall", payload);
      io.to(roomId).emit("incomingCall", payload);
    });

    socket.on("answerCall", ({ to, from, signal }) => {
      const targetId = cleanId(to);
      const senderId = cleanId(from);
      const roomId = getSecretRoomId(senderId, targetId);

      io.to(`user_${targetId}`).emit("callAccepted", { signal });
      io.to(`user_${senderId}`).emit("callAccepted", { signal });
      io.to(roomId).emit("callAccepted", { signal });
    });

    socket.on("rejectCall", ({ to, from }) => {
      const targetId = cleanId(to);
      const senderId = cleanId(from);
      const roomId = getSecretRoomId(senderId, targetId);

      io.to(`user_${targetId}`).emit("callRejected");
      io.to(`user_${senderId}`).emit("callRejected");
      io.to(roomId).emit("callRejected");
    });

    socket.on("endCall", ({ to, from }) => {
      const targetId = cleanId(to);
      const senderId = cleanId(from);
      const roomId = getSecretRoomId(senderId, targetId);

      io.to(`user_${targetId}`).emit("callEnded");
      io.to(`user_${senderId}`).emit("callEnded");
      io.to(roomId).emit("callEnded");
    });

    socket.on("missedCall", async ({ to, from, callType }) => {
      try {
        const targetId = cleanId(to);
        const senderId = cleanId(from);
        const roomId = getSecretRoomId(senderId, targetId);

        let chat = await Chat.findOne({
          participants: { $all: [senderId, targetId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [senderId, targetId],
            messages: [],
          });
        }

        const missedMsg = {
          senderId: senderId,
          text: callType === "video" ? "📹 Missed Video Call" : "📞 Missed Audio Call",
          mediaType: "missed_call",
          mediaUrl: null,
          fileName: null,
          replyTo: null,
          reactions: [],
          status: "delivered",
          isDeleted: false,
        };

        chat.messages.push(missedMsg);
        await chat.save();

        const createdMessage = chat.messages[chat.messages.length - 1];

        const senderUser = await User.findById(senderId).select("firstName lastName photoUrl");

        io.to(roomId).emit("messageReceived", {
          _id: createdMessage._id,
          senderId: senderId,
          firstName: senderUser?.firstName || "Connection",
          lastName: senderUser?.lastName || "",
          photoUrl: senderUser?.photoUrl,
          text: createdMessage.text,
          mediaUrl: null,
          mediaType: "missed_call",
          status: "delivered",
          isDeleted: false,
          createdAt: createdMessage.createdAt,
        });

        io.to(`user_${targetId}`).emit("newNotification", {
          type: "call",
          title: "Missed Call",
          message: createdMessage.text,
          link: `/chat/${senderId}`,
        });
      } catch (err) {
        console.error("Error saving missed call:", err);
      }
    });

    socket.on("iceCandidate", ({ to, from, candidate }) => {
      const targetId = cleanId(to);
      const senderId = cleanId(from);
      const roomId = getSecretRoomId(senderId, targetId);

      io.to(`user_${targetId}`).emit("iceCandidate", { candidate });
      io.to(`user_${senderId}`).emit("iceCandidate", { candidate });
      io.to(roomId).emit("iceCandidate", { candidate });
    });

    socket.on("disconnect", () => { });
  });
};

export default initializeSocket;
