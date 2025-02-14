import {
  CredentialStatus,
  JSONLDVerifiableCredential,
  VerifiableCredentialWithStatus as VerifiableCredential,
} from "../types/verifiableCredential";

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
export function extractCredentialStatus(
  vc: VerifiableCredential,
): CredentialStatus {
  let credentialStatus: CredentialStatus | undefined;
  if (
    typeof vc === "object" &&
    "@context" in vc &&
    (vc as JSONLDVerifiableCredential)["@context"]
  ) {
    // JSON-LD
    credentialStatus = vc.credentialStatus;
  } else if (typeof vc === "string") {
    // JWT
    const jwtParts = vc.split(".");
    if (jwtParts.length !== 3) {
      throw new Error("Invalid JWT");
    }

    const payloadBase64 = jwtParts[1];
    if (!payloadBase64) {
      throw new Error("Invalid JWT payload");
    }

    let payload;
    try {
      payload = JSON.parse(atob(payloadBase64));
    } catch (e) {
      throw new Error("Invalid JWT payload");
    }

    credentialStatus = payload.credentialStatus;
    if (!credentialStatus) {
      throw new Error("Invalid JWT payload");
    }
  } else {
    throw new Error("Unknown VC format");
  }

  if (!credentialStatus) {
    throw new Error("Credential status not found");
  }
  return credentialStatus;
}
