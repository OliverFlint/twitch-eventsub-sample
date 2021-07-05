import fetch, { RequestInit, Response } from "node-fetch";

export const autheticate = async (): Promise<string> => {
  const authResponse = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENTID}&client_secret=${process.env.TWITCH_CLIENTSECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );
  const json = await authResponse.json();
  return json.access_token;
};

export const getHeader = (authToken: string) => {
  const subheader = {
    "Client-Id": process.env.TWITCH_CLIENTID,
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  } as HeadersInit;
  return subheader;
};

export const getSubscriptions = async (authToken: string): Promise<any> => {
  const subsresponse = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    { headers: getHeader(authToken) } as RequestInit
  );
  return await subsresponse.json();
};

export const deleteSubscription = async (
  authToken: string,
  subscriptionid: string
): Promise<boolean> => {
  await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionid}`,
    { headers: getHeader(authToken), method: "DELETE" } as RequestInit
  );
  return true;
};

export const createSubscription = async (
  authToken: string,
  type: string,
  userid: string,
  callbackurl: string
) => {
  const body = {
    type: type,
    version: "1",
    condition: {
      broadcaster_user_id: userid,
    },
    transport: {
      method: "webhook",
      callback: callbackurl,
      secret: process.env.TWITCH_SUBSECRET,
    },
  };
  const request = {
    headers: getHeader(authToken),
    method: "POST",
    body: JSON.stringify(body),
  } as RequestInit;
  console.log(request);
  const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    request
  );
  return response;
};

export const getUser = async (userid: string, authToken: string) => {
  const request = {
    headers: getHeader(authToken),
    method: "GET",
  } as RequestInit;
  const response = await fetch(
    `https://api.twitch.tv/helix/users?id=${userid}`,
    request
  );
  return await response.json();
};
