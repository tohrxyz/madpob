import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin
} from "matrix-bot-sdk";
import 'dotenv/config'

const main = async () => {
  const homeserverUrl = process.env.HOMESERVER_URL;
  if (!homeserverUrl) throw new Error("HOMESERVER_URL must be set");
  
  const accessToken = process.env.ACCESS_TOKEN;
  if (!accessToken) throw new Error("ACCESS_TOKEN must be set");
  
  const storage = new SimpleFsStorageProvider("bot.json");
  
  const client = new MatrixClient(homeserverUrl, accessToken, storage);
  AutojoinRoomsMixin.setupOnClient(client);
  
  client.start().then(() => console.log("Client started!"));
  
  client.on("room.message", (roomId, event) => {
      if (event["content"]["msgtype"] === "m.text") {
          const sender = event["sender"];
          const body = event["content"]["body"];
  
          if (body === "!ping") {
              client.sendMessage(roomId, {
                  "msgtype": "m.notice",
                  "body": `${sender} pong!`
              });
          }
      }
  });
}

main();