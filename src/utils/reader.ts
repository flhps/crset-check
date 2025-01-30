import { EvmChain } from '@moralisweb3/common-evm-utils';
import { ethers } from 'ethers';
import Moralis from 'moralis';
import { APIConfig, StatusCheckOptions } from '../types/config';

/**
 * Reconstructs the original data from hex string blob data.
 *
 * @param data - The hex string to be decoded.
 * @returns The original data as a string.
 */
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
   // Remove the '00' padding in every 32-byte chunk
   let result = '';
   for (let i = 2; i < data.length; i += 64) {
     const chunk = data.slice(i, i + 62);
     result += chunk;
   }
   result = '0x' + result;
   // Pad the result to 128 KB if necessary
   if (result.length !== 128*1024) {
     result = result.padEnd(128*1024, '00');
   }
   return result;
}

/**
 * Fetches the blob data from the sender address.
 *
 * @param senderAddress - The sender address to fetch the blob data from.
 * @param apiConfig - The configuration object containing API keys.
 * @param options - Optional parameters for status check.
 * @returns The original data as a string.
 *
 * @remarks
 * This function uses Moralis and Infura APIs to fetch transaction data and retrieve blob data.
 * It emits progress events at various stages of the process.
 *
 * @throws Will throw an error if no transactions are found for the given address.
 *
 * @example
 * ```typescript
 * const apiConfig = {
 *   infuraApiKey: 'your-infura-api-key',
 *   moralisApiKey: 'your-moralis-api-key',
 * };
 * const options = {
 *   emitter: new EventEmitter(),
 *   clientId: 'your-client-id',
 * };
 * const blobData = await getBlobDataFromSenderAddress('0xSenderAddress', apiConfig, options);
 * console.log(blobData);
 * ```
 */
export async function getBlobDataFromSenderAddress(
  senderAddress: string,
  apiConfig: APIConfig,
  options?: StatusCheckOptions,
): Promise<string> {
  // TODO: adapt for >6 blobs => multiple transactions
  const { emitter, clientId } = options || { emitter: null, clientId: null };

  // TODO: allow user to choose provider
  const {
    infuraApiKey: ethersProviderAPIKey,
    moralisApiKey,
    blobScanUrl: blobScanAPIUrl,
    // alchemyApiKey,
  } = apiConfig;

  // use wrapped Infura API for getting full transaction-data
  let infuraProvider = new ethers.InfuraProvider(
    'sepolia',
    ethersProviderAPIKey,
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
      apiKey: moralisApiKey,
      // ...and any other configuration
    });
  }

  let transfers;
  let blobVersionedHashes: string | any[] = [];

  try {
    console.log('before getAssetTransfers, ' + senderAddress);
    emitter?.emit('progress', {
      clientId: clientId,
      step: 'getAssetTransfers',
      status: 'started',
    });
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
      order: 'DESC',
    });
    // if (transfers.transfers.length === 0) {
    //   throw new Error('No transfers found');
    // }
    console.log('after getAssetTransfers');
    emitter?.emit('progress', {
      clientId: clientId,
      step: 'getAssetTransfers',
      status: 'completed',
      additionalMetrics: { transferCount: transfers.result.length },
    });
    // Retrieve the latest blob transaction and its blobVersionedHash(s)
    let i = 0;
    emitter?.emit('progress', {
      clientId: clientId,
      step: 'getBlobVersionedHashes',
      status: 'started',
    });
    // Account for multiple blobs in a single transaction
    while (blobVersionedHashes.length === 0) {
      const latestTxHash = transfers.result[i]?.hash;
      if (latestTxHash) {
        const tx = await infuraProvider.getTransaction(latestTxHash);
        if (tx?.to?.toLowerCase() == senderAddress.toLowerCase()) {
          blobVersionedHashes = tx?.blobVersionedHashes
            ? tx?.blobVersionedHashes
            : [];
        }
        i++;
      } else {
        throw new Error('No transactions found for address ' + senderAddress);
      }
    }
    emitter?.emit('progress', {
      clientId: clientId,
      step: 'getBlobVersionedHashes',
      status: 'completed',
      additionalMetrics: {
        txHash: transfers.result[i - 1]?.hash,
        blobCount: blobVersionedHashes.length,
        firstBlobVersionedHash: blobVersionedHashes[0],
      },
    });
  } catch (error) {
    console.error(error);
  }

  // Fetch the blob data using API of choice and convert it back to a string
  emitter?.emit('progress', {
    clientId: clientId,
    step: 'fetchAndConcatBlobData',
    status: 'started',
  });
  let temp = '';
  for (const blobVersionedHash of blobVersionedHashes) {
    const blobData = await fetch(
      `${blobScanAPIUrl}${blobVersionedHash}/data`,
    ).then((response) => response.text());
    // Remove the '0x' prefix and starting/trailing quotation marks
    temp = temp + blobData.replace(/['"]+/g, '').slice(2);
  }
  emitter?.emit('progress', {
    clientId: clientId,
    step: 'fetchAndConcatBlobData',
    status: 'completed',
  });
  emitter?.emit('progress', {
    clientId: clientId,
    step: 'reconstructBlobData',
    status: 'started',
  });
  const blobString = reconstructBlobData(temp);
  emitter?.emit('progress', {
    clientId: clientId,
    step: 'reconstructBlobData',
    status: 'completed',
  });
  return blobString;
}
