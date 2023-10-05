import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin
} from "matrix-bot-sdk";
import 'dotenv/config';

import {
  MultisigClient,
  MultisigProposalListItem,
  ProposalQueryParams,
  ProposalSortBy,
} from "@aragon/sdk-client";
import { ProposalStatus, SortDirection } from "@aragon/sdk-client-common";
import { context } from "./contextStore";

const main = async () => {
  const daoAddress = process.env.DAO_ADDRESS;
  if (!daoAddress) throw new Error("DAO_ADDRESS must be set");
  console.log("daoAddress: ", daoAddress)
  const multisigClient = new MultisigClient(context);

  const queryParams: ProposalQueryParams = {
    direction: SortDirection.ASC, // optional. otherwise, DESC
    sortBy: ProposalSortBy.CREATED_AT, //optional. otherwise, NAME, VOTES (POPULARITY coming soon)
    status: ProposalStatus.ACTIVE, // optional. otherwise, PENDING, SUCCEEDED, EXECUTED, DEFEATED
    daoAddressOrEns: daoAddress, // or my-dao.dao.eth
  };

  const multisigProposals: MultisigProposalListItem[] = await multisigClient
  .methods.getProposals(queryParams);
  console.log(multisigProposals);

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

          if (body === "!proposals") {
            client.sendMessage(roomId, {
                "msgtype": "m.notice",
                "body": `${JSON.stringify(multisigProposals)}`
            });
          }
      }
  });
}

main();