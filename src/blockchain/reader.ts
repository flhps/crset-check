import { Alchemy, Network } from "alchemy-sdk";
import dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config({path:'../../.env'});

let infuraProvider = new ethers.InfuraProvider(
  'sepolia',
  process.env.INFURA_API_KEY,
);


function blobHexToString(blobHex: string) {
  //ChatGPT says it works - have to run it twice though
  // Step 1: Remove the '0x' prefix if it exists
  if (blobHex.startsWith('0x')) {
    blobHex = blobHex.slice(2);
  }

  // Step 2: Convert hex string to a Uint8Array
  const byteArray = new Uint8Array(
    blobHex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)),
  );

  // Step 3: Decode the Uint8Array back to a string
  const decoder = new TextDecoder();
  return decoder.decode(byteArray);
}

function getBlobDataFromSenderAddress(senderAddress: string){

  //use Alchemy to get transactions given an address
  const config = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
  };
  const alchemy = new Alchemy(config);

  // @ts-ignore
  alchemy.core.getAssetTransfers({
    fromAddress: senderAddress,
    toAddress: senderAddress,
    category: ["external"],
    order: "desc",
  }).then((response) => {
    const latestTxHash = response.transfers[0]!.hash;
    infuraProvider.getTransaction(latestTxHash).then((tx) => {
      const blobVersionedHash = tx!.blobVersionedHashes![0];
      console.log(blobVersionedHash);

      // get blob data by the blobVersionedHash using the blobscan API, then translate it back to a string
      fetch(`https://api.sepolia.blobscan.com/blobs/${blobVersionedHash}/data`).then((response) => {
        response.text().then((data) => {
          const finalData = blobHexToString(blobHexToString(data.replace(/['"]+/g, '')));
          console.log(finalData);
        });
      })
    });
  });
};

getBlobDataFromSenderAddress(process.env.ADDRESS!);

