import {isAddress} from 'ethers';
import {fromDataHexString, isInBFC,} from '../../../padded-bloom-filter-cascade/src/index.ts'; // TODO: replace with actual import path, for now configure according to your local setup of padded-bloom-filter-cascade
import {VerifiableCredentialWithStatus as VerifiableCredential} from '../types/verifiableCredential.ts';
import {extractCredentialStatus} from '../utils/extractCredentialStatus.ts';
import {getBlobDataFromSenderAddress} from '../utils/reader.ts';
import {EventEmitter} from 'events';
// dotenv.config({ path: '../../.env' });

export type StatusCheckOptions = {
  emitter: EventEmitter;
  clientId: string;
}

/**
 * Checks if a Verifiable Credential (VC) has been revoked via bloom filter cascade.
 *
 * @param vc - The Verifiable Credential to check.
 * @param options - Additional options for real-time-updatable verification progress tracking.
 * @returns A promise that resolves to a boolean indicating whether the credential is revoked.
 *
 * @remarks
 * This function handles both JSON-LD and JWT VCs. It extracts the credential status, retrieves the account address from the CAIP-10 account ID,
 * and fetches the blob data from the sender address. It then reconstructs the bloom filter cascade from the blob data and checks if the credential
 * is in the bloom filter cascade.
 *
 * @example
 * ```typescript
 * const vc: VerifiableCredential = { ... };
 * const rpcUrl = new URL('https://example.com');
 * const isRevoked = await isRevoked(vc, rpcUrl);
 * console.log(isRevoked); // true or false
 * ```
 */
export async function isRevoked(
  vc: VerifiableCredential,
  options?: StatusCheckOptions,
): Promise<boolean> {
  const {emitter, clientId} = options || {emitter: null, clientId: null};
  emitter?.emit('progress', {clientId: clientId, step: 'extractPublisherAddress', status: 'started'});
  // Check if VC is JSON-LD or JWT, handle accordingly
  const credentialStatus = extractCredentialStatus(vc);
  const credentialId = credentialStatus.id;
  // const credentialId = "urn:eip155:1:0x32328bfaea51ce120db44f7755a1170e9cc43653:aa603829bbe0e77c446e90798535645af4c34c89337dcc1e6fa4bec7f4408daa0c7309c577b27d0145cfb599d0fd8d385d562c73e9878f33094647f8037d1cf8";
  // Get account address from CAIP-10 account ID in credential status
  const accountAddress = credentialId.split(':')[3];
  emitter?.emit('progress', {clientId: clientId, step: 'extractPublisherAddress', status: 'completed', additionalMetrics: {address: accountAddress}});
  // const accountAddress = process.env.ADDRESS;
  if (!isAddress(accountAddress)) {
    throw new Error('Invalid Ethereum address: ' + accountAddress);
  } else {
    console.log("Valid Ethereum address: " + accountAddress);
  }

  // Get blob data from sender address
  const blobData = await getBlobDataFromSenderAddress(
    accountAddress,
    process.env.INFURA_API_KEY!,
    process.env.ALCHEMY_API_KEY!,
    options,
  );

  // Reconstruct bloom filter cascade from blob data
  emitter?.emit('progress', {clientId: clientId, step: 'reconstructBFC', status: 'started'});
  const [filter, salt] = fromDataHexString(blobData);
  emitter?.emit('progress', {clientId: clientId, step: 'reconstructBFC', status: 'completed', additionalMetrics: {levelCount: filter.length}});
  emitter?.emit('progress', {clientId: clientId, step: 'checkRevocation', status: 'started'});
  const isRevoked = !isInBFC(credentialId, filter, salt);
  emitter?.emit('progress', {clientId: clientId, step: 'checkRevocation', status: 'completed', additionalMetrics: {isRevoked: isRevoked}});
  // Check if credential is revoked
  return isRevoked;
}
// isRevoked({} as VerifiableCredential, new URL('https://example.com')).then((isRevoked) => {console.log(isRevoked)});