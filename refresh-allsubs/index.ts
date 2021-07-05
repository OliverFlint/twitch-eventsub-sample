import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as TwitchHelper from "../helpers/twitch";
import * as DataHelper from "../helpers/data";
import * as GitHubHelper from "../helpers/github";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const authToken = await TwitchHelper.autheticate();
  const ids = await DataHelper.getCurrentIds();
  for (let index = 0; index < ids.length; index++) {
    const id = ids[index];
    // update twitch data
    try {
      const twitchdata = await TwitchHelper.getUser(id, authToken);
      await GitHubHelper.setFileContent(
        JSON.stringify(twitchdata.data[0]),
        `Refreshing: ${id}`,
        `${id}.json`,
        "user",
        context
      );
    } catch (error) {
      context.log(`💣 User data update failed!. ${JSON.stringify(error)}`);
    }

    // update vod data
    try {
      const voddata = await TwitchHelper.getVod(id, authToken);
      await GitHubHelper.setFileContent(
        JSON.stringify(voddata.data[0]),
        `Refreshing: ${id}`,
        `${id}.json`,
        "vod",
        context
      );
    } catch (error) {
      context.log(`💣 Vod data update failed!. ${JSON.stringify(error)}`);
    }
  }
};

export default httpTrigger;
