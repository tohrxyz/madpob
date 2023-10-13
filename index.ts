import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin,
} from "matrix-bot-sdk";

import { 
  getDaoDetails,
  getNewestProposal,
  periodicProposalScan
} from "./helpers";

import { 
  daoAddress,
  homeserverUrl,
  accessToken,
 } from "./envs/constants";

const main = async () => {
  const storage = new SimpleFsStorageProvider("bot.json");
  
  const client = new MatrixClient(homeserverUrl, accessToken, storage);
  AutojoinRoomsMixin.setupOnClient(client);
  
  client.start().then(() => console.log("Client started!"));

  periodicProposalScan(client);
  
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
                "body": `Commands: !ping, !dao, !help !newestProposal`
            });
          }

          if (body === "!newestProposal") {
            const newestProposal = await getNewestProposal();

            if (!newestProposal) {
              client.sendMessage(roomId, {
                "msgtype": "m.notice",
                "body": `No newest proposal found`
              });
              return;
            }
            
            const title = newestProposal.metadata.title;
            const summary = newestProposal.metadata.summary;
            
            const timeLeft = newestProposal.endDate.getSeconds() - Date.now() / 1000;
            let timeLeftString = "Ended";
            if (timeLeft > 0) {
              const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
              timeLeftString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
            }

            const url = `https://app.aragon.org/#/daos/polygon/${daoAddress}/governance/proposals/${newestProposal.id}`;

            const markdownFormatted = `Newest proposal:\n\nTitle: ${title}\n\nSummary: ${summary}\n\nTime left: ${timeLeftString}\n\nLink: ${url}`;

            client.sendMessage(roomId, {
              "msgtype": "m.text",
              "body": markdownFormatted
            })
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