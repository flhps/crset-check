# CRSet Checker

A library that verifies W3C Verifiable Credentials' revocation status using CRSet, an EIP-4844 blob-based status list on the Ethereum blockchain.

## Overview

Verifiers already have good libraries available to validate the format and signatures of VCs, which do not interfere with the VC's status. This library provides a standalone method to determine whether a VC has been revoked through the CRSet mechanism. For more details, refer to the [links and references](#links-and-references) section.

## Usage

### Prerequisites

To use this library, you need to have an **[Infura API key](https://support.infura.io/account/api-keys/create-new-key)**. You also need to have a **[Moralis API key](https://docs.moralis.com/2.0/web3-data-api/evm/get-your-api-key)** to access the blob data. Finally, you need to provide a **blob scan URL** to query the blob data. It looks as follows (for Sepolia testnet): `https://api.sepolia.blobscan.com/blob`. For the mainnet, it would be `https://api.blobscan.com/blob`.

### Example Usage

```typescript
import { isRevoked } from 'bfc-status-check';

const vc: VerifiableCredential = { ... };
const apiConfig = {
    infuraApiKey: 'your-infura-api-key',
    moralisApiKey: 'your-moralis-api-key',
    blobScanUrl: 'https://api.sepolia.blobscan.com/blob', // or 'https://api.blobscan.com/blob'

};
const options = {
    emitter: new EventEmitter(),
    clientId: 'your-client-id',
};

const isRevoked = await isRevoked(vc, apiConfig, options);
console.log(isRevoked); // true or false
```

## Links and References

- **[EIP-4844: Shard Blob Transactions](https://eips.ethereum.org/EIPS/eip-4844)**
- **[W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)**
- ![arXiv](https://img.shields.io/badge/arXiv-2501.17089-b31b1b.svg)
  **[CRSet: Non-Interactive Verifiable Credential Revocation with Metadata Privacy for Issuers and Everyone Else](https://arxiv.org/abs/2501.17089)**  
  _Hoops et al., 2025._
- ![GitHub](https://img.shields.io/badge/GitHub-padded--bloom--filter--cascade-blue?logo=github)
  **[crset-cascade](https://github.com/jfelixh/crset-cascade/)**
