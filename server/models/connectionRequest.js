import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// Prevent self-requests
connectionRequestSchema.pre("validate", function () {
  if (this.fromUserId.equals(this.toUserId)) {
    this.invalidate(
      "toUserId",
      "Cannot send connection request to yourself!"
    );
  }
});



const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

export default ConnectionRequest;
