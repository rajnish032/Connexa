import Chat from "../models/chat.js";

export const getOrCreateChat = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
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
