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
  //const contentresponse = await GitHubHelper.getFileContents("streamers.json");
  const ids = await DataHelper.getCurrentIds();
  //const ids = JSON.parse(contentresponse);

  // remove existing subs
  const subsjson = await TwitchHelper.getAllSubscriptions(authToken);
  for (let index = 0; index < subsjson.data.length; index++) {
    const sub = subsjson.data[index];
    try {
      await TwitchHelper.deleteSubscription(authToken, sub.id);
      context.log(`✔️ Deleted subscription ${sub.id}.`);
    } catch (error) {
      context.log(`💣 deleteSubscription failed! Id: ${sub.id}`);
    }
  }

  // Register subscriptions
  const subtypes = [
    "channel.update",
    "stream.online",
    "stream.offline",
    "user.update",
  ];
  for (let index = 0; index < ids.length; index++) {
    const id = ids[index];
    for (let stindex = 0; stindex < ids.length; stindex++) {
      const subtype = subtypes[stindex];
      try {
        const subResponse = await TwitchHelper.createSubscription(
          authToken,
          subtype,
          id,
          `${context.req.url}callback`,
          context
        );
        if (subResponse.ok) {
          context.log(`✔️ ${subtype} Subscription registered for ${id}.`);
        } else {
          context.log(
            `❌ ${subtype} Subscription failed for ${id}. ${subResponse.status}, ${subResponse.statusText}`
          );
        }
      } catch (error) {
        context.log(
          `💣 createSubscription failed! Type: ${subtype}, User: ${id}`
        );
      }
    }
  }
};

export default httpTrigger;
