import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin
} from "matrix-bot-sdk";
import 'dotenv/config';

import {
  Client,
} from "@aragon/sdk-client";
import { context } from "./contextStore";

const getDaoDetails = async () => {
  const aragonClient = new Client(context);
  const daoAddress = process.env.DAO_ADDRESS;
  
  if (!daoAddress) throw new Error("DAO_ADDRESS must be set");

  const daoDetails = await aragonClient.methods.getDao(daoAddress).then((dao) => {
    return dao;
  });
  return daoDetails;
}

const main = async () => {
  const daoAddress = process.env.DAO_ADDRESS;
  if (!daoAddress) throw new Error("DAO_ADDRESS must be set");
  console.log("daoAddress: ", daoAddress)

  const homeserverUrl = process.env.HOMESERVER_URL;
  if (!homeserverUrl) throw new Error("HOMESERVER_URL must be set");
  
  const accessToken = process.env.ACCESS_TOKEN;
  if (!accessToken) throw new Error("ACCESS_TOKEN must be set");
  
  const storage = new SimpleFsStorageProvider("bot.json");
  
  const client = new MatrixClient(homeserverUrl, accessToken, storage);
  AutojoinRoomsMixin.setupOnClient(client);
  
  client.start().then(() => console.log("Client started!"));

  const roomID = process.env.ROOM_ID;
  if (!roomID) throw new Error("ROOM_ID must be set");

  setInterval(async () => {
    client.sendMessage(roomID, {
      "msgtype": "m.notice",
      "body": `Commands: !ping, !dao, !help`
    });
  }, 43200000);
  
  client.on("room.message", async (roomId, event) => {
      if (event["content"]["msgtype"] === "m.text") {
          const sender = event["sender"];
          const body = event["content"]["body"];
  
          if (body === "!ping") {
              client.sendMessage(roomId, {
                  "msgtype": "m.notice",
                  "body": `${sender} pong!`
              });
          }

          if (body === "!dao") {
            const daoDetails = await getDaoDetails();
            client.sendMessage(roomId, {
                "msgtype": "m.notice",
                "body": `${JSON.stringify(daoDetails, null, 2)}`
            });
          }

          if (body === "!help") {
            client.sendMessage(roomId, {
                "msgtype": "m.notice",
                "body": `Commands: !ping, !dao, !help`
            });
          }
      }
  });

  // doesnt work yet for some reason

  // client.on("room.join", (roomId: string, event: any) => {
  //   console.log("Joined room: ", roomId)
  //   const sender = event["sender"];
  //   client.sendMessage(roomId, {
  //       "msgtype": "m.notice",
  //       "body": `${sender} joined the room!`
  //   });
  // });

  // client.on("room.leave", (roomId: string, event: any) => {
  //   console.log("Left room: ", roomId)
  //   const sender = event["sender"];
  //   client.sendMessage(roomId, {
  //       "msgtype": "m.notice",
  //       "body": `${sender} left the room!`
  //   });
  // });
}

main();