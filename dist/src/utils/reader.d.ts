import { APIConfig, StatusCheckOptions } from '../types/config';
/**
 * Reconstructs the original data from hex string blob data.
 *
 * @param data - The hex string to be decoded.
 * @returns The original data as a string.
 */
export declare function reconstructBlobData(data: string): string;
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
export declare function getBlobDataFromSenderAddress(senderAddress: string, apiConfig: APIConfig, options?: StatusCheckOptions): Promise<string>;
//# sourceMappingURL=reader.d.ts.map