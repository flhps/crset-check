import { type EventEmitter } from "node:events";

export interface APIConfig {
  infuraApiKey: string;
  moralisApiKey: string;
  blobScanUrl: string;
}

export interface StatusCheckOptions {
  emitter: EventEmitter;
  clientId: string;
}
