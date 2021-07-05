import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as TwitchHelper from "../helpers/twitch";
import * as DataHelper from "../helpers/data";
import * as GitHubHelper from "../helpers/github";
import fetch, { RequestInit, BodyInit, Response } from "node-fetch";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // Authenticate
  const authToken = await TwitchHelper.autheticate();

  // Get existing ids
  const contentresponse = await GitHubHelper.getFileContents("streamers.json");
  const ids = await DataHelper.getCurrentIds();
  //const ids = JSON.parse(contentresponse);

  // remove existing subs
  const subsjson = await TwitchHelper.getSubscriptions(authToken);
  for (let index = 0; index < subsjson.data.length; index++) {
    const sub = subsjson.data[index];
    await TwitchHelper.deleteSubscription(authToken, sub.id);
  }

  // Register subscriptions
  const subtypes = [
    "channel.update",
    "stream.online",
    "stream.offline",
    "user.update",
  ];
  ids.forEach(async (id) => {
    subtypes.forEach(async (subtype) => {
      const subResponse = await TwitchHelper.createSubscription(
        authToken,
        subtype,
        id,
        `${context.req.url}callback`
      );
      if (subResponse.ok) {
        console.log("Subscription created.");
      }
    });
  });
};

export default httpTrigger;
