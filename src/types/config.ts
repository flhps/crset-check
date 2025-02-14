import { type EventEmitter } from "events";

export interface APIConfig {
  infuraApiKey: string;
  moralisApiKey: string;
  blobScanUrl: string;
}

export interface StatusCheckOptions {
  emitter: EventEmitter;
  clientId: string;
}
