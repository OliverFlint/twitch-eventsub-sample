import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createHmac } from "crypto";
import * as TwitchHelper from "../helpers/twitch";
import * as GitHubHelper from "../helpers/github";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const substatus = req.body.subscription.status;

  if (substatus === "webhook_callback_verification_pending") {
    // verify subscription
    if (req.headers["twitch-eventsub-message-signature"]) {
      const hmac_message =
        req.headers["twitch-eventsub-message-id"] +
        req.headers["twitch-eventsub-message-timestamp"] +
        Buffer.from(req.rawBody, "utf8");
      const signature = createHmac("sha256", "1a2s3d4f5g6h")
        .update(hmac_message)
        .digest("hex");
      if (
        req.headers["twitch-eventsub-message-signature"] !==
        `sha256=${signature}`
      ) {
        context.res = {
          status: 403,
        };
        console.log("Signature check failed!");
        return;
      }
      const challenge = req.body.challenge;
      context.res = {
        headers: { "Content-Type": "text/html" },
        status: 200,
        body: challenge,
      } as ResponseInit;
      console.log("Signature check passed");
      return;
    }
  } else if (substatus === "enabled") {
    // subscription enabled
    console.log(
      `Event: ${req.body.subscription.type}, User: ${req.body.subscription.condition.broadcaster_user_id}`
    );
    const authToken = await TwitchHelper.autheticate();
    const twitchdata = await TwitchHelper.getUser(
      req.body.subscription.condition.broadcaster_user_id,
      authToken
    );
    GitHubHelper.setFileContent(
      JSON.stringify(twitchdata),
      `Updating: ${req.body.subscription.condition.broadcaster_user_id}, Event: ${req.body.subscription.type}`,
      `${req.body.subscription.condition.broadcaster_user_id}.json`
    );
  } else {
    console.log(substatus);
  }

  // default response
  context.res = {
    status: 200,
  } as ResponseInit;
};

export default httpTrigger;
