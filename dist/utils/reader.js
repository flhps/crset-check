import { EvmChain } from '../node_modules/@moralisweb3/common-evm-utils/lib/esm/index.js';
import Moralis from '../node_modules/moralis/lib/esm/index.js';
import { InfuraProvider } from '../node_modules/ethers/lib.esm/providers/provider-infura.js';

/**
 * Reconstructs the original data from hex string blob data.
 *
 * @param data - The hex string to be decoded.
 * @returns The original data as a string.
 */
function reconstructBlobData(data) {
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
    const byteArray = new Uint8Array(data.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
    // Decode the Uint8Array back to a string
    const decoder = new TextDecoder();
    return decoder.decode(byteArray);
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
async function getBlobDataFromSenderAddress(senderAddress, apiConfig, options) {
    var _a, _b, _c;
    // TODO: adapt for >6 blobs => multiple transactions
    const { emitter, clientId } = options || { emitter: null, clientId: null };
    // TODO: allow user to choose provider
    const { infuraApiKey: ethersProviderAPIKey, moralisApiKey, blobScanUrl: blobScanAPIUrl,
    // alchemyApiKey,
     } = apiConfig;
    // use wrapped Infura API for getting full transaction-data
    let infuraProvider = new InfuraProvider('sepolia', ethersProviderAPIKey);
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
    let blobVersionedHashes = [];
    try {
        console.log('before getAssetTransfers, ' + senderAddress);
        emitter === null || emitter === void 0 ? void 0 : emitter.emit('progress', {
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
        emitter === null || emitter === void 0 ? void 0 : emitter.emit('progress', {
            clientId: clientId,
            step: 'getAssetTransfers',
            status: 'completed',
            additionalMetrics: { transferCount: transfers.result.length },
        });
        // Retrieve the latest blob transaction and its blobVersionedHash(s)
        let i = 0;
        emitter === null || emitter === void 0 ? void 0 : emitter.emit('progress', {
            clientId: clientId,
            step: 'getBlobVersionedHashes',
            status: 'started',
        });
        // Account for multiple blobs in a single transaction
        while (blobVersionedHashes.length === 0) {
            const latestTxHash = (_a = transfers.result[i]) === null || _a === void 0 ? void 0 : _a.hash;
            if (latestTxHash) {
                const tx = await infuraProvider.getTransaction(latestTxHash);
                if (((_b = tx === null || tx === void 0 ? void 0 : tx.to) === null || _b === void 0 ? void 0 : _b.toLowerCase()) == senderAddress.toLowerCase()) {
                    blobVersionedHashes = (tx === null || tx === void 0 ? void 0 : tx.blobVersionedHashes)
                        ? tx === null || tx === void 0 ? void 0 : tx.blobVersionedHashes
                        : [];
                }
                i++;
            }
            else {
                throw new Error('No transactions found for address ' + senderAddress);
            }
        }
        emitter === null || emitter === void 0 ? void 0 : emitter.emit('progress', {
            clientId: clientId,
            step: 'getBlobVersionedHashes',
            status: 'completed',
            additionalMetrics: {
                txHash: (_c = transfers.result[i - 1]) === null || _c === void 0 ? void 0 : _c.hash,
                blobCount: blobVersionedHashes.length,
                firstBlobVersionedHash: blobVersionedHashes[0],
            },
        });
    }
    catch (error) {
        console.error(error);
    }
    // Fetch the blob data using API of choice and convert it back to a string
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'fetchAndConcatBlobData',
        status: 'started',
    });
    let temp = '';
    for (const blobVersionedHash of blobVersionedHashes) {
        const blobData = await fetch(`${blobScanAPIUrl}${blobVersionedHash}/data`).then((response) => response.text());
        // Remove the '0x' prefix and starting/trailing quotation marks
        temp = temp + blobData.replace(/['"]+/g, '').slice(2);
    }
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'fetchAndConcatBlobData',
        status: 'completed',
    });
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'reconstructBlobData',
        status: 'started',
    });
    const blobString = reconstructBlobData(temp);
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'reconstructBlobData',
        status: 'completed',
    });
    return blobString;
}

export { getBlobDataFromSenderAddress, reconstructBlobData };
//# sourceMappingURL=reader.js.map
