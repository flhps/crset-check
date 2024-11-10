import { VerifiableCredential } from '@digitalcredentials/vc-data-model';

// second argument is the rpc URL of a fitting blockchain node, should be a consensus node for blobs or maybe just an api key
export function isRevoked(vc: VerifiableCredential, rpc: URL): boolean {
  return false;
}
