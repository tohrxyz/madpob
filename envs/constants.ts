import 'dotenv/config';

export const daoAddress = process.env.DAO_ADDRESS ? process.env.DAO_ADDRESS : "";
export const homeserverUrl = process.env.HOMESERVER_URL ? process.env.HOMESERVER_URL : "";
export const accessToken = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : "";
export const roomID = process.env.ROOM_ID ? process.env.ROOM_ID : "";