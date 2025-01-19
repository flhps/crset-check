import {
  Alchemy,
  AssetTransfersCategory,
  Network,
  SortingOrder,
} from 'alchemy-sdk';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import {EventEmitter} from 'events';
import {StatusCheckOptions} from "../lib/StatusCheck.ts";

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
  options?: StatusCheckOptions
): Promise<string> {
  /**
   * Fetches the blob data from the sender address.
   * @param senderAddress - The sender address to fetch the blob data from.
   * @returns The original data as a string.
   */
  // TODO: adapt for >6 blobs => multiple transactions
  // TODO: allow user to choose provider
  const {emitter, clientId} = options || {emitter: null, clientId: null};

  // use wrapped Infura API for getting full transaction-data
  let infuraProvider = new ethers.InfuraProvider(
    'sepolia',
    ethersProviderAPIKey
  );

  // use Alchemy's Transfers API to get fetch historical transactions of an address
  // const config = {
  //   apiKey: alchemyAPIKey,
  //   network: Network.ETH_SEPOLIA,
  // };
  // const alchemy = new Alchemy(config);
  // Alchemy is not working, so we use Moralis instead
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
      // ...and any other configuration
    })
  }

  let transfers;
  let blobVersionedHashes: string | any[] = [];

  try {
    console.log("before getAssetTransfers, "+senderAddress);
    emitter?.emit('progress', {clientId: clientId, step: 'getAssetTransfers', status: 'started'});
    // transfers = await alchemy.core
    //   .getAssetTransfers({
    //     fromAddress: senderAddress,
    //     toAddress: senderAddress,
    //     category: [AssetTransfersCategory.EXTERNAL],
    //     order: SortingOrder.DESCENDING,
    //     excludeZeroValue: false,
    //   });
  transfers = await Moralis.EvmApi.transaction.getWalletTransactions({
    address: senderAddress,
    chain: EvmChain.SEPOLIA,
    order: "DESC",
  });
    // if (transfers.transfers.length === 0) {
    //   throw new Error('No transfers found');
    // }
    console.log("after getAssetTransfers");
    emitter?.emit('progress', {clientId: clientId, step: 'getAssetTransfers', status: 'completed', additionalMetrics: {transferCount: transfers.result.length}});
    // Retrieve the latest blob transaction and its blobVersionedHash(s)
    let i = 0;
    emitter?.emit('progress', {clientId: clientId, step: 'getBlobVersionedHashes', status: 'started'});
    // Account for multiple blobs in a single transaction
    while (blobVersionedHashes.length === 0) {
      const latestTxHash = transfers.result[i]?.hash;
      if (latestTxHash) {
        const tx = await infuraProvider.getTransaction(latestTxHash);
        if (tx?.to?.toLowerCase() == senderAddress.toLowerCase()) {
          blobVersionedHashes = tx?.blobVersionedHashes ? tx?.blobVersionedHashes : [];
        }
        i++;
      } else {
        throw new Error('No transactions found for address '+senderAddress);
      }
    }
    emitter?.emit('progress', {clientId: clientId, step: 'getBlobVersionedHashes', status: 'completed', additionalMetrics: {txHash: transfers.result[i-1]?.hash, blobCount: blobVersionedHashes.length, firstBlobVersionedHash: blobVersionedHashes[0]}});
  } catch (error) {
    console.error(error);
  }

  // Fetch the blob data using API of choice and convert it back to a string
  emitter?.emit('progress', {clientId: clientId, step: 'fetchAndConcatBlobData', status: 'started'});
  let temp= "";
  for (const blobVersionedHash of blobVersionedHashes) {
    const blobData = await fetch(
      `${process.env.BLOBSCAN_API_URL}${blobVersionedHash}/data`,
    ).then((response) => response.text());
    // Remove the '0x' prefix and starting/trailing quotation marks
    temp=temp+(blobData.replace(/['"]+/g, '').slice(2));
  }
  emitter?.emit('progress', {clientId: clientId, step: 'fetchAndConcatBlobData', status: 'completed'});
  emitter?.emit('progress', {clientId: clientId, step: 'reconstructBlobData', status: 'started'});
  const blobString = reconstructBlobData(temp);
  emitter?.emit('progress', {clientId: clientId, step: 'reconstructBlobData', status: 'completed'});
  return blobString;
}

// console.log(await getBlobDataFromSenderAddress(process.env.ADDRESS!));
