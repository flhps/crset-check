import { EventEmitter } from 'events';

/*!
 * Copyright (c) 2022 Digital Credentials Consortium. All rights reserved.
 */
type Type = string | string[];
interface ImageObject {
    id: string;
    type?: Type;
    [x: string]: any;
}
interface LinkedDataObject {
    id?: string;
    type?: Type;
    name?: string;
    description?: string;
    image?: string | ImageObject;
}
interface IssuerObject extends LinkedDataObject {
    id: string;
    url?: string;
    [x: string]: any;
}
type CompactJWT = string;
interface VCDIVerifiableCredential extends LinkedDataObject {
    '@context': string[] | any;
    id?: string;
    type: Type;
    issuer: string | IssuerObject;
    validFrom?: string;
    validUntil?: string;
    credentialSubject: CredentialSubject | CredentialSubject[];
    credentialStatus?: CredentialStatus$1 | CredentialStatus$1[];
    credentialSchema?: CredentialSchema | CredentialSchema[];
    relatedResource?: RelatedResource | RelatedResource[];
    evidence?: Evidence | Evidence[];
    refreshService?: RefreshService | RefreshService[];
    termsOfUse?: TermsOfUse | TermsOfUse[];
    confidenceMethod?: ConfidenceMethod | ConfidenceMethod[];
    renderMethod?: RenderMethod | RenderMethod[];
    proof?: any;
    [x: string]: any;
}
interface CredentialSubject extends LinkedDataObject {
    [x: string]: any;
}
interface CredentialStatus$1 extends LinkedDataObject {
    id?: string;
    type: Type;
    [x: string]: any;
    statusPurpose?: string;
    statusListIndex?: string | number;
    statusListCredential?: string;
}
interface CredentialSchema {
    id: string;
    type: string;
    [x: string]: any;
}
interface TermsOfUse {
    id?: string;
    type: string;
    [x: string]: any;
}
interface RefreshService {
    type: string;
    [x: string]: any;
}
interface RelatedResource {
    id: string;
    digestSRI: string;
    mediaType?: string;
}
interface Evidence {
    id?: string;
    type: string;
    [x: string]: any;
}
interface ConfidenceMethod {
    id?: string;
    type: string;
    [x: string]: any;
}
interface RenderMethod {
    type: string;
    [x: string]: any;
}

interface CredentialStatus {
    id: string;
    type: 'BFCStatusEntry';
    statusPurpose: 'revocation';
    statusPublisher: string;
}
type VerifiableCredentialWithoutStatus = Omit<VCDIVerifiableCredential, 'credentialStatus'>;
interface JSONLDVerifiableCredential extends VerifiableCredentialWithoutStatus {
    credentialStatus: CredentialStatus;
}
type VerifiableCredentialWithStatus = CompactJWT | JSONLDVerifiableCredential;

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
declare function extractCredentialStatus(vc: VerifiableCredentialWithStatus): CredentialStatus;

interface APIConfig {
    infuraApiKey: string;
    moralisApiKey: string;
    alchemyApiKey: string;
    blobScanUrl: string;
}
interface StatusCheckOptions {
    emitter: EventEmitter;
    clientId: string;
}

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
declare function isRevoked(vc: VerifiableCredentialWithStatus, apiConfig: APIConfig, options?: StatusCheckOptions): Promise<boolean>;

export { type CredentialStatus, type JSONLDVerifiableCredential, type VerifiableCredentialWithStatus, type VerifiableCredentialWithoutStatus, extractCredentialStatus, isRevoked };
