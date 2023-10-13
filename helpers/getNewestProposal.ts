import { ProposalQueryParams, ProposalSortBy, TokenVotingClient, TokenVotingProposalListItem } from "@aragon/sdk-client";
import { context } from "../contextStore";
import { SortDirection } from "@aragon/sdk-client-common";
import { daoAddress } from "../envs/constants";

export const getNewestProposal = async () => {
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