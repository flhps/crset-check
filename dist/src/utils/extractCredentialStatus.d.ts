import { CredentialStatus, VerifiableCredentialWithStatus as VerifiableCredential } from '../types/verifiableCredential.ts';
/**
 * Extracts the credential status from a Verifiable Credential (VC).
 *
 * This function supports both JSON-LD and JWT formatted VCs. For JSON-LD VCs,
 * it directly accesses the `credentialStatus` property. For JWT formatted VCs,
 * it parses the JWT and extracts the `credentialStatus` from the payload.
 *
 * @param vc - The Verifiable Credential from which to extract the credential status.
 *             This can be either a JSON-LD object or a JWT string.
 * @returns The extracted CredentialStatus if available.
 * @throws Will throw an error if the VC format is unknown, or if the JWT is invalid or does not contain a credential status.
 */
export declare function extractCredentialStatus(vc: VerifiableCredential): CredentialStatus;
//# sourceMappingURL=extractCredentialStatus.d.ts.map