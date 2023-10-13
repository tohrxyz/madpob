import { MatrixClient } from "matrix-bot-sdk";
import { daoAddress, roomID } from "../envs/constants";
import { getNewestProposal } from "./getNewestProposal";
import { isProposalNew } from "./isProposalNew";

export const periodicProposalScan = async (client: MatrixClient) => {
  setInterval(async () => {
    console.log(`${Date.now()}`, "Checking for new proposals");
    const newestProposal = await getNewestProposal();
    
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
      const days = Math.floor(timeLeft / (24 * 60 * 60));
      const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
      const seconds = Math.floor(timeLeft % 60);
      timeLeftString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
    }
  
    const url = `https://app.aragon.org/#/daos/polygon/${daoAddress}/governance/proposals/${newestProposal.id}`;
  
    const markdownFormatted = `New proposal was published!!!\n\nTitle: ${title}\n\nSummary: ${summary}\n\nTime left: ${timeLeftString}\n\nLink: ${url}`;
  
    console.log("newestProposal.startDate: ", newestProposal.startDate.getTime() / 1000)
    console.log("newestProposal.startDate.getSeconds(): ", newestProposal.startDate.getSeconds())
    if (isProposalNew(newestProposal.startDate.getTime())) {
      client.sendMessage(roomID, {
        "msgtype": "m.text",
        "body": markdownFormatted
      })  
    }
  }, 600000)
}