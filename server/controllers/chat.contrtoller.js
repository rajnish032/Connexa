import Chat from "../models/chat.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const getOrCreateChat = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName photoUrl",
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [userId, targetUserId],
        messages: [],
      });
    }

    res.json(chat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    let fileSource = null;
    let fileName = req.body.fileName || "file";
    let mediaType = req.body.mediaType || "image";

    if (req.file) {
      // Handled via Multer multipart upload
      fileSource = req.file.buffer;
      fileName = req.file.originalname || fileName;

      if (req.file.mimetype.startsWith("image/")) mediaType = "image";
      else if (req.file.mimetype.startsWith("video/")) mediaType = "video";
      else if (req.file.mimetype.startsWith("audio/")) mediaType = "audio";
      else mediaType = "document";
    } else if (req.body.fileData) {
      // Base64 upload fallback
      fileSource = req.body.fileData;
    }

    if (!fileSource) {
      return res.status(400).json({ message: "No file provided." });
    }

    const result = await uploadToCloudinary(fileSource, mediaType, fileName);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { chatId, messageId, emoji } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const message = chat.messages.id(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await chat.save();
    res.json({ success: true, reactions: message.reactions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteChatMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const message = chat.messages.id(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.mediaUrl || message.publicId) {
      await deleteFromCloudinary(message.publicId || message.mediaUrl, message.mediaType);
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.mediaUrl = null;
    message.mediaType = null;
    message.publicId = null;

    await chat.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
