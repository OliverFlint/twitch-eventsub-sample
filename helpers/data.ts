import fetch from "node-fetch";

export const getCurrentData = async (): Promise<any[]> => {
  const data = await fetch(
    "https://raw.githubusercontent.com/whitep4nth3r/womenwhostream.tech/main/scripts/data/streamers.json"
  );
  return await data.json();
};

export const getCurrentIds = async (): Promise<string[]> => {
  const data = await getCurrentData();
  const ids = data.map((value) => {
    return value.twitchData.id as string;
  });
  return ids;
};
