import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

export const getReceivedRequests = async (req, res) => {
  try {
    const data = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({ data });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

export const getConnections = async (req, res) => {
  try {
    const loggedInUser = req.user;

    const requests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = requests.map((r) =>
      r.fromUserId._id.toString() === loggedInUser._id.toString()
        ? r.toUserId
        : r.fromUserId
    );

    res.json({ data });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;

    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
    });

    const hiddenIds = new Set();
    connections.forEach((c) => {
      hiddenIds.add(c.fromUserId.toString());
      hiddenIds.add(c.toUserId.toString());
    });

    const users = await User.find({
      _id: { $nin: [...hiddenIds, req.user._id] },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).send(err.message);
  }
};
