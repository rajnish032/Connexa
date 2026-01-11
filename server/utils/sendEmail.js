// import { SendEmailCommand } from "@aws-sdk/client-ses";
// import { sesClient } from "./sesClient.js";

// const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
//   return new SendEmailCommand({
//     Destination: {
//       CcAddresses: [],
//       ToAddresses: [toAddress],
//     },
//     Message: {
//       Body: {
//         Html: {
//           Charset: "UTF-8",
//           Data: `<h1>${body}</h1>`,
//         },
//         Text: {
//           Charset: "UTF-8",
//           Data: "This is the text format email",
//         },
//       },
//       Subject: {
//         Charset: "UTF-8",
//         Data: subject,
//       },
//     },
//     Source: fromAddress,
//     ReplyToAddresses: [],
//   });
// };

// export const run = async (subject, body, toEmailId) => {
//   const sendEmailCommand = createSendEmailCommand(
//     toEmailId,
//     "akshay@devtinder.in",
//     subject,
//     body
//   );

//   try {
//     return await sesClient.send(sendEmailCommand);
//   } catch (err) {
//     if (err instanceof Error && err.name === "MessageRejected") {
//       return err;
//     }
//     throw err;
//   }
// };

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: "Connexa <onboarding@resend.dev>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      reply_to: options.replyTo,
    };

    const response = await resend.emails.send(mailOptions);

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error in sending email:", error);
    return null;
  }
};


// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const response = await resend.emails.send({
//       from: "Connexa <onboarding@resend.dev>",
//       //to, // ✅ REQUIRED
//       to: ['rajnishmaurya250@gmail.com'],
//       subject,
//       html,
//     });

//     console.log("Email sent to:", to);
//     return response;
//   } catch (error) {
//     console.error("Resend error:", error?.error?.message || error);
//     return null;
//   }
// };