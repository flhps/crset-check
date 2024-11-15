import { VerifiableCredentialWithStatus as VerifiableCredential } from '../types/verifiableCredential.ts';
import { VCDIVerifiableCredential } from '@digitalcredentials/vc-data-model/dist/VerifiableCredential.js';

// second argument is the rpc URL of a fitting blockchain node, should be a consensus node for blobs or maybe just an api key
export function isRevoked(vc: VerifiableCredential, rpc: URL): boolean {
  (vc as VCDIVerifiableCredential)['@context'] = {

  }
  return false;
}
