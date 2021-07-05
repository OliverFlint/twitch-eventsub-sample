import { Octokit } from "octokit";

export const getFileContents = async (filename: string) => {
  const octo = new Octokit({ auth: process.env.GIT_TOKEN });
  const content = await octo.rest.repos.getContent({
    owner: process.env.GIT_OWNER,
    path: `${process.env.GIT_PATH}/${filename}`,
    repo: process.env.GIT_REPO,
  });
  const base64content = (content.data as any).content as string;
  const buffer = Buffer.from(base64content, "base64");
  return buffer.toString("utf8");
};

export const setFileContent = async (
  content: string,
  message: string,
  filename: string
) => {
  const buffer = Buffer.from(content);
  const octo = new Octokit({ auth: process.env.GIT_TOKEN });
  try {
    let existingsha = undefined;
    try {
      const existing = await octo.rest.repos.getContent({
        owner: process.env.GIT_OWNER,
        path: `${process.env.GIT_PATH}/${filename}`,
        repo: process.env.GIT_REPO,
      });
      existingsha = (existing.data as any).sha;
    } catch {}
    const commit = await octo.rest.repos.createOrUpdateFileContents({
      message: message,
      owner: process.env.GIT_OWNER,
      repo: process.env.GIT_REPO,
      content: buffer.toString("base64"),
      path: `${process.env.GIT_PATH}/${filename}`,
      sha: existingsha,
    });
  } catch (error) {
    console.log(JSON.stringify(error));
  }
};
