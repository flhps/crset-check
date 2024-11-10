import { VerifiableCredential } from '@digitalcredentials/vc-data-model';

export interface CredentialStatus {
  id: string;
  type: 'BFCStatusEntry';
  statusPurpose: 'revocation';
  statusPublisher: string; // CAIP-10 account ID
}

export type VerifiableCredentialWithStatus = VerifiableCredential & {
  credentialStatus: CredentialStatus;
};
