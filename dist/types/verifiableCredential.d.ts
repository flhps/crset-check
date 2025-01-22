import { CompactJWT, VCDIVerifiableCredential } from '@digitalcredentials/vc-data-model/dist/VerifiableCredential.js';
export interface CredentialStatus {
    id: string;
    type: 'BFCStatusEntry';
    statusPurpose: 'revocation';
    statusPublisher: string;
}
export type VerifiableCredentialWithoutStatus = Omit<VCDIVerifiableCredential, 'credentialStatus'>;
export interface JSONLDVerifiableCredential extends VerifiableCredentialWithoutStatus {
    credentialStatus: CredentialStatus;
}
export type VerifiableCredentialWithStatus = CompactJWT | JSONLDVerifiableCredential;
//# sourceMappingURL=verifiableCredential.d.ts.map