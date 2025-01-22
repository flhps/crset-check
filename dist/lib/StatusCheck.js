import { extractCredentialStatus } from '../utils/extractCredentialStatus.js';
import { getBlobDataFromSenderAddress } from '../utils/reader.js';
import { fromDataHexString, isInBFC } from '../node_modules/padded-bloom-filter-cascade/dist/lib/bloom-filter-cascade.js';
import 'crypto';
import '../node_modules/padded-bloom-filter-cascade/dist/_virtual/hex-to-bin.js';
import { isAddress } from '../node_modules/ethers/lib.esm/address/checks.js';

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
async function isRevoked(vc, apiConfig, options) {
    const { emitter, clientId } = options || { emitter: null, clientId: null };
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'extractPublisherAddress',
        status: 'started',
    });
    // Check if VC is JSON-LD or JWT, handle accordingly
    const credentialStatus = extractCredentialStatus(vc);
    const credentialId = credentialStatus.id;
    // Get account address from CAIP-10 account ID in credential status
    const accountAddress = credentialId.split(':')[3];
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'extractPublisherAddress',
        status: 'completed',
        additionalMetrics: { address: accountAddress },
    });
    // const accountAddress = process.env.ADDRESS;
    if (!isAddress(accountAddress)) {
        throw new Error('Invalid Ethereum address: ' + accountAddress);
    }
    else {
        console.log('Valid Ethereum address: ' + accountAddress);
    }
    // Get blob data from sender address
    const blobData = await getBlobDataFromSenderAddress(accountAddress, apiConfig, options);
    // Reconstruct bloom filter cascade from blob data
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'reconstructBFC',
        status: 'started',
    });
    const [filter, salt] = fromDataHexString(blobData);
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'reconstructBFC',
        status: 'completed',
        additionalMetrics: { levelCount: filter.length },
    });
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'checkRevocation',
        status: 'started',
    });
    const isRevoked = !isInBFC(credentialId, filter, salt);
    emitter === null || emitter === undefined ? undefined : emitter.emit('progress', {
        clientId: clientId,
        step: 'checkRevocation',
        status: 'completed',
        additionalMetrics: { isRevoked: isRevoked },
    });
    return isRevoked;
}

export { isRevoked };
//# sourceMappingURL=StatusCheck.js.map
