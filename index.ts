import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin,
} from "matrix-bot-sdk";
import 'dotenv/config';

import {
  Client, ProposalQueryParams, ProposalSortBy, TokenVotingClient, TokenVotingProposalListItem,
} from "@aragon/sdk-client";
import { context } from "./contextStore";
import { SortDirection, ProposalStatus } from "@aragon/sdk-client-common";

const isProposalNew = (startDate: number) => {
  const now = Date.now() / 1000;
  const startDateSeconds = startDate / 1000;

  const diff = now - startDateSeconds;

  console.log("now: ", now)
  console.log("startDate: ", startDateSeconds)
  console.log("diff in isPropnew: ", diff);

  if (diff < 2000 && diff > 0) {
    return true;
  } else {
    return false;
  }
}

const getDaoDetails = async () => {
  const aragonClient = new Client(context);
  const daoAddress = process.env.DAO_ADDRESS;
  
  if (!daoAddress) throw new Error("DAO_ADDRESS must be set");

  const daoDetails = await aragonClient.methods.getDao(daoAddress).then((dao) => {
    return dao;
  });
  return daoDetails;
}

const getNewestProposal = async () => {
  const daoAddress = process.env.DAO_ADDRESS;
  if (!daoAddress) throw new Error("DAO_ADDRESS must be set");

  const tokenVotingClient: TokenVotingClient = new TokenVotingClient(context);

  const queryParams: ProposalQueryParams = {
    skip: 0, // optional
    limit: 10, // optional
    direction: SortDirection.DESC, // optional, otherwise DESC ("descending")
    sortBy: ProposalSortBy.CREATED_AT, // optional, otherwise NAME, VOTES (POPULARITY coming soon)
    // status: ProposalStatus.ACTIVE, // optional, otherwise PENDING, SUCCEEDED, EXECUTED, DEFEATED
    daoAddressOrEns: daoAddress
  };

  const tokenVotingProposals: TokenVotingProposalListItem[] = await tokenVotingClient.methods.getProposals(queryParams);
  // console.log("tokenVotingProposals: ", tokenVotingProposals)

  const newestProposal = tokenVotingProposals[0];
  return newestProposal;
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

  setInterval(async () => {
    console.log(`${Date.now()}`, "Checking for new proposals");
    const newestProposal = await getNewestProposal();
    // console.log("newestProposal: ", newestProposal);
    
    if (!newestProposal) {
      console.log("No newest proposal found");
      return;
    }

    const title = newestProposal.metadata.title;
    const summary = newestProposal.metadata.summary;
    
    const timeLeft = (newestProposal.endDate.getTime() / 1000) - (Date.now() / 1000);
    console.log("timeLeft: ", timeLeft);
    let timeLeftString = "Ended";
    if (timeLeft > 0) {
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      timeLeftString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
    }

    const url = `https://app.aragon.org/#/daos/polygon/0xffaadc1def31595d0cc50fbca165a6f34e4402a0/governance/proposals/${newestProposal.id}`;

    const markdownFormatted = `New proposal was published!!!\n\nTitle: ${title}\n\nSummary: ${summary}\n\nTime left: ${timeLeftString}\n\nLink: ${url}`;

    console.log("newestProposal.startDate: ", newestProposal.startDate.getTime() / 1000)
    console.log("newestProposal.startDate.getSeconds(): ", newestProposal.startDate.getSeconds())
    if (isProposalNew(newestProposal.startDate.getTime())) {
      client.sendMessage(roomID, {
        "msgtype": "m.text",
        "body": markdownFormatted
      })  
    }
  }, 10000)
  
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

            if (!newestProposal) throw new Error("No newest proposal found");
            
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

            client.sendMessage(roomID, {
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