import { EvmChain } from "@moralisweb3/common-evm-utils";
import { ethers } from "ethers";
import Moralis from "moralis";
import { APIConfig, StatusCheckOptions } from "../types/config";

/**
 * Reconstructs the original data from hex string blob data.
 *
 * @param data - The hex string to be decoded.
 * @returns The original data as a string.
 */
export function reconstructBlobData(data: string) {
  // Remove the '0x' prefix if it exists (just in case)
  if (data.startsWith("0x")) {
    data = data.slice(2);
  }
  // Remove the '00' padding in every 32-byte chunk
  let result = "";
  for (let i = 2; i < data.length; i += 64) {
    const chunk = data.slice(i, i + 62);
    result += chunk;
  }
  return "0x" + result;
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
  } = apiConfig;

  // use wrapped Infura API for getting full transaction-data
  const infuraProvider = new ethers.InfuraProvider(
    "sepolia",
    ethersProviderAPIKey,
  );

  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: moralisApiKey,
    });
  }

  let transfers;
  let blobVersionedHashes: string | string[] = [];

  try {
    emitter?.emit("progress", {
      clientId: clientId,
      step: "getAssetTransfers",
      status: "started",
    });

    transfers = await Moralis.EvmApi.transaction.getWalletTransactions({
      address: senderAddress,
      chain: EvmChain.SEPOLIA,
      order: "DESC",
    });

    emitter?.emit("progress", {
      clientId: clientId,
      step: "getAssetTransfers",
      status: "completed",
      additionalMetrics: { transferCount: transfers.result.length },
    });
    // Retrieve the latest blob transaction and its blobVersionedHash(s)
    let i = 0;
    emitter?.emit("progress", {
      clientId: clientId,
      step: "getBlobVersionedHashes",
      status: "started",
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
        throw new Error("No transactions found for address " + senderAddress);
      }
    }
    emitter?.emit("progress", {
      clientId: clientId,
      step: "getBlobVersionedHashes",
      status: "completed",
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
  emitter?.emit("progress", {
    clientId: clientId,
    step: "fetchAndConcatBlobData",
    status: "started",
  });
  let temp = "";
  for (const blobVersionedHash of blobVersionedHashes) {
    const response = await fetch(`${blobScanAPIUrl}/${blobVersionedHash}/data`);

    if (!response.ok) {
      const data = (await response.json()) as { message: string };
      throw new Error(`Failed to fetch blob data: ${data.message}`);
    }

    const blobData = await response.text();
    // Remove the '0x' prefix and starting/trailing quotation marks
    temp = temp + blobData.replace(/['"]+/g, "").slice(2);
  }

  emitter?.emit("progress", {
    clientId: clientId,
    step: "fetchAndConcatBlobData",
    status: "completed",
  });
  emitter?.emit("progress", {
    clientId: clientId,
    step: "reconstructBlobData",
    status: "started",
  });
  const blobString = reconstructBlobData(temp);
  emitter?.emit("progress", {
    clientId: clientId,
    step: "reconstructBlobData",
    status: "completed",
  });

  return blobString;
}
