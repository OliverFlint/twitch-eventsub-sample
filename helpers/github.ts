import { Context } from "@azure/functions";
import { Octokit } from "octokit";

export const getFileContents = async (filename: string) => {
  const octo = new Octokit({ auth: process.env.GIT_TOKEN });
  const content = await getContent(filename);
  const base64content = (content.data as any).content as string;
  const buffer = Buffer.from(base64content, "base64");
  return buffer.toString("utf8");
};

export const getContent = async (filename: string) => {
  const octo = new Octokit({ auth: process.env.GIT_TOKEN });
  const content = await octo.rest.repos.getContent({
    owner: process.env.GIT_OWNER,
    path: `${process.env.GIT_PATH}/${filename}`,
    repo: process.env.GIT_REPO,
  });
  return content;
};

export const setFileContent = async (
  content: string,
  message: string,
  filename: string,
  type: "user" | "vod",
  context: Context
) => {
  const octo = new Octokit({ auth: process.env.GIT_TOKEN });
  try {
    let existingsha = undefined;
    let existingdata = { twitchData: undefined, streamData: undefined };

    //get existing
    try {
      const existing = await getContent(filename);
      existingdata = JSON.parse(
        Buffer.from(
          (existing.data as any).content as string,
          "base64"
        ).toString("utf8")
      );
      existingsha = (existing.data as any).sha;
    } catch {}

    //prepare data/buffer
    if (type === "user") {
      existingdata.twitchData = JSON.parse(content);
    } else if (type === "vod") {
      existingdata.streamData = JSON.parse(content);
    }
    const buffer = Buffer.from(JSON.stringify(existingdata));

    // upsert
    const commit = await octo.rest.repos.createOrUpdateFileContents({
      message: `${message}, Type: ${type}`,
      owner: process.env.GIT_OWNER,
      repo: process.env.GIT_REPO,
      content: buffer.toString("base64"),
      path: `${process.env.GIT_PATH}/${filename}`,
      sha: existingsha,
    });
    context.log(`✔️ ${type} Upload to github succeeded!.`);
  } catch (error) {
    context.log(
      `💣 ${type} Upload to github failed!. ${JSON.stringify(error)}`
    );
  }
};
