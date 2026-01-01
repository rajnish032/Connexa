import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient.js";

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<h1>${body}</h1>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: "This is the text format email",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

export const run = async (subject, body, toEmailId) => {
  const sendEmailCommand = createSendEmailCommand(
    toEmailId,
    "akshay@devtinder.in",
    subject,
    body
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (err) {
    if (err instanceof Error && err.name === "MessageRejected") {
      return err;
    }
    throw err;
  }
};
