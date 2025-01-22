import { type EventEmitter } from 'events';
export interface APIConfig {
    infuraApiKey: string;
    moralisApiKey: string;
    alchemyApiKey: string;
    blobScanUrl: string;
}
export interface StatusCheckOptions {
    emitter: EventEmitter;
    clientId: string;
}
//# sourceMappingURL=util.d.ts.map