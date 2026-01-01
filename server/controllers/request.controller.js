import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";

export const sendRequest = async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const fromUserId = req.user._id;

    if (!["ignored", "interested"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: "User not found" });

    const exists = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (exists)
      return res.status(400).json({ message: "Request already exists" });

    const data = await ConnectionRequest.create({
      fromUserId,
      toUserId,
      status,
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

export const reviewRequest = async (req, res) => {
  try {
    const { status, requestId } = req.params;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: req.user._id,
      status: "interested",
    });

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    request.status = status;
    const data = await request.save();

    res.json({ data });
  } catch (err) {
    res.status(400).send(err.message);
  }
};
