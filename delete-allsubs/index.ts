import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as TwitchHelper from "../helpers/twitch";
import * as DataHelper from "../helpers/data";

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
};

export default httpTrigger;
