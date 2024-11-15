import {
  Alchemy,
  AssetTransfersCategory,
  Network,
  SortingOrder,
} from 'alchemy-sdk';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config({ path: '../../.env' });

// use wrapped Infura API for getting full transaction-data
let infuraProvider = new ethers.InfuraProvider(
  'sepolia',
  process.env.INFURA_API_KEY,
);

export function blobHexToString(blobHex: string) {
  // Remove the '0x' prefix if it exists (just in case)
  if (blobHex.startsWith('0x')) {
    blobHex = blobHex.slice(2);
  }

  // Convert hex string to a Uint8Array
  const byteArray = new Uint8Array(
    blobHex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)),
  );

  // Decode the Uint8Array back to a string
  const decoder = new TextDecoder();
  return decoder.decode(byteArray);
}

export async function getBlobDataFromSenderAddress(
  senderAddress: string,
): Promise<string> {
  // use Alchemy's Transfers API to get fetch historical transactions of an address
  const config = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
  };
  const alchemy = new Alchemy(config);
  const transfers = await alchemy.core
    .getAssetTransfers({
      fromAddress: senderAddress,
      toAddress: senderAddress,
      category: [AssetTransfersCategory.EXTERNAL],
      order: SortingOrder.DESCENDING,
      withMetadata: true,
      excludeZeroValue: false,
    });

  // Retrieve the latest blob transaction and its blobVersionedHash(s)
  let blobVersionedHashes: string | any[] = [];
  let i = 0;
  // Account for multiple blobs in a single transaction
  while (blobVersionedHashes.length === 0) {
    const latestTxHash = transfers.transfers[i]!.hash;
    const tx = await infuraProvider.getTransaction(latestTxHash);
    blobVersionedHashes = tx?.blobVersionedHashes ? tx?.blobVersionedHashes: [];
    i++;
  }

  // Fetch the blob data using API of choice and convert it back to a string
  let temp= "";
  for (const blobVersionedHash of blobVersionedHashes) {
    const blobData = await fetch(
      `${process.env.BLOBSCAN_API_URL}${blobVersionedHash}/data`,
    ).then((response) => response.text());
    // Remove the '0x' prefix and starting/trailing quotation marks
    temp=temp+(blobData.replace(/['"]+/g, '').slice(2));
  }
  const preProcessedBlobData = blobHexToString(temp);

  const blobString = blobHexToString(preProcessedBlobData);

  return blobString;
}

console.log(await getBlobDataFromSenderAddress(process.env.ADDRESS!));
