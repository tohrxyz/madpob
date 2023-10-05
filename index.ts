import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin
} from "matrix-bot-sdk";

import 'dotenv/config'

const homeserverUrl = process.env.HOMESERVER_URL;
if (!homeserverUrl) throw new Error("HOMESERVER_URL must be set");

const accessToken = process.env.ACCESS_TOKEN;
if (!accessToken) throw new Error("ACCESS_TOKEN must be set");

const storage = new SimpleFsStorageProvider("bot.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

client.start().then(() => console.log("Client started!"));