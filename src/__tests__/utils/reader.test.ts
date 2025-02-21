import { CRSetCascade } from "crset-cascade";
import { reconstructBlobData } from "../../utils/reader";
import testBlob from "./testblob.json";

describe("reconstructBlobData", () => {
  const blobString = testBlob.message;
  const trimmedBlobString = blobString.replace(/['"]+/g, "").slice(2);

  test("should reconstruct correct length of true data from one blob", () => {
    const result = reconstructBlobData(trimmedBlobString);
    // blob is 128KiB, one out of 32 bytes is unused, 2 chars form a byte, 2 bytes for Ox prefix
    // 128 B * 1024 / 32 * 31 = 126.976 B
    expect(result.length).toBe(((128 * 1024) / 32) * 31 * 2 + 2);
  });

  test("should reconstruct to a Bloom filter cascade", () => {
    const blobData = reconstructBlobData(trimmedBlobString);
    const cascade = CRSetCascade.fromDataHexString(blobData);
    expect(cascade.getSalt().length).toBe(64);
    expect(cascade.getDepth()).toBe(29);
    const credentialId =
      "aed78b3df6b85c6eb87e0ae2bd93ec5f9cfd7e23b9a43e6196d6a614bb930d4e";
    expect(cascade.has(credentialId)).toBe(true);
    const credentialId2 =
      "4384112c6bfe937078e6315dfe76a29464fc63b0480ebba0c0a21a1f18da4350";
    expect(cascade.has(credentialId2)).toBe(false);
  });
});
