import { APIConfig, StatusCheckOptions } from '../types/config';
import { VerifiableCredentialWithStatus as VerifiableCredential } from '../types/verifiableCredential';
/**
 * Checks if a Verifiable Credential (VC) has been revoked via bloom filter cascade.
 *
 * @param vc - The Verifiable Credential to check.
 * @param apiConfig - The API configuration for making network requests.
 * @param options - Optional parameters for status checking.
 * @param options.emitter - An optional event emitter for progress updates.
 * @param options.clientId - An optional client ID for tracking progress.
 * @returns A promise that resolves to a boolean indicating whether the VC is revoked.
 *
 * @throws Will throw an error if the Ethereum address extracted from the credential status is invalid.
 *
 * @example
 * ```typescript
 * const vc: VerifiableCredential = { ... };
 * const apiConfig = {
 *   infuraApiKey: 'your-infura-api-key',
 *   moralisApiKey: 'your-moralis-api-key',
 *   alchemyApiKey: 'your-alchemy-api-key',
 *   blobScanUrl: 'your-blob-scan-url',
 * };
 * const options = {
 *   emitter: new EventEmitter(),
 *   clientId: 'your-client-id',
 * };
 * const isRevoked = await isRevoked(vc, apiConfig, options);
 * console.log(isRevoked); // true or false
 * ```
 */
export declare function isRevoked(vc: VerifiableCredential, apiConfig: APIConfig, options?: StatusCheckOptions): Promise<boolean>;
//# sourceMappingURL=StatusCheck.d.ts.map