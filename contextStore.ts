import { Context, ContextParams, SupportedNetwork } from "@aragon/sdk-client-common";

// // OPTION B: For a more advanced option, you can use the following ContextParams. This will allow you to use your own custom values if desired.
// export const contextParams: ContextParams = {
//   // Choose the network you want to use. You can use "goerli" (Ethereum) or "maticmum" (Mumbai) for testing, or "mainnet" (Ethereum) and "polygon" (Polygon) for mainnet.
//   network: "polygon",
//   // Optional on "rinkeby", "arbitrum-rinkeby" or "mumbai"
//   // Pass the address of the  `DaoFactory` contract you want to use. You can find it here based on your chain of choice: https://github.com/aragon/core/blob/develop/active_contracts.json
//   // Optional. Leave it empty to use Aragon's DAO Factory contract and claim a dao.eth subdomain
//   daoFactoryAddress: "",
//   // Optional. Pass the address of the ensRegistry for networks other than Mainnet or Goerli.
//   // It will default to the registry deployed by Aragon. You can check them here: https://github.com/aragon/osx/blob/develop/active_contracts.json
//   ensRegistryAddress: "0x1234381072385710239847120734123847123",
//   // Choose your Web3 provider: Cloudfare, Infura, Alchemy, etc.
//   // Remember to change the list of providers if a different network is selected
//   web3Providers: ["https://rpc.ankr.com/polygon"],
// };

const minimalContextParams: ContextParams = {
  // Choose the network you want to use. You can use "goerli" (Ethereum) or "maticmum" (Polygon) for testing, or "mainnet" (Ethereum) and "polygon" (Polygon) for mainnet.
  network: SupportedNetwork.POLYGON,
  web3Providers: "https://rpc.ankr.com/polygon",
  // This is the signer account who will be signing transactions for your app. You can use also use a specific account where you have funds, through passing it `new Wallet("your-wallets-private-key")` or pass it in dynamically when someone connects their wallet to your dApp.
  // signer: Wallet.createRandom(),
};

export const context: Context = new Context(minimalContextParams);