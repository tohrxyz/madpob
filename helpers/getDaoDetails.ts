import { Client } from "@aragon/sdk-client";
import { context } from "../contextStore";
import { daoAddress } from "../envs/constants";

export const getDaoDetails = async () => {
  const aragonClient = new Client(context);
  
  if (!daoAddress) throw new Error("DAO_ADDRESS must be set");

  const daoDetails = await aragonClient.methods.getDao(daoAddress).then((dao) => {
    return dao;
  });
  return daoDetails;
}