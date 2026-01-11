import cron from "node-cron";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { sendEmail } from "./sendEmail.js";
import ConnectionRequest from "../models/connectionRequest.js";

// Runs every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  //cron.schedule("* * * * *", async () => {
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
        const res = await sendEmail({
          to: email, // ✅ REAL USER EMAIL
          subject: "New Friend Requests Pending",
          html: `
          <h2>Hello 👋</h2>
          <p>You have new friend requests pending.</p>
          `,
          });

        console.log(res);
      } catch (err) {
        console.error(`Failed to send email to ${email}`, err);
      }
    }
  } catch (err) {
    console.error("Cron job error:", err);
  }
});
