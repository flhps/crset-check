import {
  Alchemy,
  AssetTransfersCategory,
  Network,
  SortingOrder,
} from 'alchemy-sdk';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config({ path: '../../.env' });

export function reconstructBlobData(data: string) {
  /**
   * Reconstructs the original data from a hex string.
   * @param data - The hex string to be decoded.
   * @returns The original data as a string.
   */
  // Remove the '0x' prefix if it exists (just in case)
  if (data.startsWith('0x')) {
    data = data.slice(2);
  }
  // Convert hex string to a Uint8Array
  const byteArray = new Uint8Array(
    data.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)),
  );
  // Decode the Uint8Array back to a string
  const decoder = new TextDecoder();
  return decoder.decode(byteArray);
}

export async function getBlobDataFromSenderAddress(
  senderAddress: string,
  ethersProviderAPIKey: string,
  alchemyAPIKey: string,
): Promise<string> {
  /**
   * Fetches the blob data from the sender address.
   * @param senderAddress - The sender address to fetch the blob data from.
   * @returns The original data as a string.
   */
  // TODO: adapt for >6 blobs => multiple transactions
  // TODO: allow user to choose provider
  // use wrapped Infura API for getting full transaction-data
  let infuraProvider = new ethers.InfuraProvider(
    'sepolia',
    ethersProviderAPIKey
  );

  // use Alchemy's Transfers API to get fetch historical transactions of an address
  const config = {
    apiKey: alchemyAPIKey,
    network: Network.ETH_SEPOLIA,
  };
  const alchemy = new Alchemy(config);
  const transfers = await alchemy.core
    .getAssetTransfers({
      fromAddress: senderAddress,
      toAddress: senderAddress,
      category: [AssetTransfersCategory.EXTERNAL],
      order: SortingOrder.DESCENDING,
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
  const blobString = reconstructBlobData(temp);
  return blobString;
}

// console.log(await getBlobDataFromSenderAddress(process.env.ADDRESS!));
