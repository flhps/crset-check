# CRSet Check

A library that verifies W3C Verifiable Credentials' revocation status using CRSet, an EIP-4844 blob-based status list on the Ethereum blockchain.

## Overview

Verifiers already have good libraries available to validate the format and signatures of VCs, which do not interfere with the VC's status. This library provides a standalone method to determine whether a VC has been revoked through the CRSet mechanism. For more details, refer to the [links and references](#links-and-references) section.

## Usage

### Prerequisites

To use this library, you need to have an **[Infura API key](https://support.infura.io/account/api-keys/create-new-key)**. You also need to have a **[Moralis API key](https://docs.moralis.com/2.0/web3-data-api/evm/get-your-api-key)** to access the blob data. Finally, you need to provide a **blob scan URL** to query the blob data. It looks as follows (for Sepolia testnet): `https://api.sepolia.blobscan.com/blobs`. For the mainnet, it would be `https://api.blobscan.com/blobs`.

### Installation

```bash
npm install github:jfelixh/bfc-status-check
```

### Example Usage

An optional `emitter` can be passed to the `isRevoked` function. It will be used to emit events during the process that can be used for debugging or progress visualization. The emitter could be set up like this:

```typescript
const emitter = new EventEmitter();
emitter.on("progress", (data) => {
  console.log(data);
});
```

The complete example usage looks as follows:

```typescript
import { isRevoked } from "crset-check";

const vc: VerifiableCredential = { ... };
const apiConfig = {
  infuraApiKey: "your-infura-api-key",
  moralisApiKey: "your-moralis-api-key",
  blobScanUrl: "https://api.sepolia.blobscan.com/blobs", // or "https://api.blobscan.com/blobs"
};
const options = {
  emitter: new EventEmitter(),
  clientId: "your-client-id",
};

const isRevoked = await isRevoked(vc, apiConfig, options);
console.log(isRevoked); // true or false
```

Note that the `clientId` is optional and can be used to identify one of multiple clients/users in the emitted events.

## Links and References

- **[EIP-4844: Shard Blob Transactions](https://eips.ethereum.org/EIPS/eip-4844)**
- **[W3C Verifiable Credentials Data Model 1.1](https://www.w3.org/TR/vc-data-model/)**
- ![arXiv](https://img.shields.io/badge/arXiv-2501.17089-b31b1b.svg)
  **[CRSet: Non-Interactive Verifiable Credential Revocation with Metadata Privacy for Issuers and Everyone Else](https://arxiv.org/abs/2501.17089)**  
  _Hoops et al., 2025._
- ![GitHub](https://img.shields.io/badge/GitHub-padded--bloom--filter--cascade-blue?logo=github)
  **[crset-cascade](https://github.com/jfelixh/crset-cascade/)**
