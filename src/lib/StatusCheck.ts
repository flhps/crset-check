import { AccountId } from 'caip';
import { fromDataHexString as reconstructBFC } from '../../../padded-bloom-filter-cascade/src/index.ts'; // TODO: replace with actual import path, for now configure according to your local setup of padded-bloom-filter-cascade
import { VerifiableCredentialWithStatus as VerifiableCredential } from '../types/verifiableCredential.ts';
import { extractCredentialStatus } from '../utils/extractCredentialStatus.ts';
import { getBlobDataFromSenderAddress } from '../utils/reader.ts';
import { isAddress } from 'ethers';

/**
 * Checks if a Verifiable Credential (VC) has been revoked via bloom filter cascade.
 *
 * @param vc - The Verifiable Credential to check.
 * @param rpc - The RPC URL of a fitting blockchain node, should be a consensus node for blobs or an API key.
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
  rpc: URL,
): Promise<boolean> {
  // Check if VC is JSON-LD or JWT, handle accordingly
  const credentialStatus = extractCredentialStatus(vc);
  const credentialId = credentialStatus.id;

  // Get account address from CAIP-10 account ID in credential status
  const account = new AccountId(credentialStatus.statusPublisher).toJSON();
  const accountAddress = account.address;
  if (!isAddress(accountAddress)) {
    throw new Error('Invalid Ethereum address');
  }

  // Get blob data from sender address
  // TODO: incorporate rpc URL
  const blobData = await getBlobDataFromSenderAddress(accountAddress);

  // Reconstruct bloom filter cascade from blob data
  const [filter, salt] = reconstructBFC(blobData);

  // Check if credential is in bloom filter cascade
  for (let i = 0; i < filter.length; i++) {
    const key = `${credentialId}${i}${salt}`;
    if (!filter[i].includes(key)) {
      return i % 2 === 1 ? false : true;
    }
  }

  return filter.length % 2 === 1 ? false : true;
}
