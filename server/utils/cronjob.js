import cron from "node-cron";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { run as sendEmail } from "./sendEmail.js";
import ConnectionRequest from "../models/connectionRequest.js";

// This job will run at 8 AM every day
cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];

    for (const email of listOfEmails) {
      try {
        await sendEmail(
          `New Friend Requests pending for ${email}`,
          "There are multiple friend requests pending. Please login to DevTinder.in to accept or reject them.",
          email
        );
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});
