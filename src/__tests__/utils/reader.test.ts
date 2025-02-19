import { fromDataHexString, isInBFC } from "crset-cascade";
import { reconstructBlobData } from "../../utils/reader";
import testBlob from "./testblob.json";

describe("reconstructBlobData", () => {
  const blobString = testBlob.message;
  const trimmedBlobString = blobString.replace(/['"]+/g, "").slice(2);

  test("should reconstruct correct length of true data from one blob", () => {
    const result = reconstructBlobData(trimmedBlobString);
    // blob is 128KiB, one out of 32 bytes is unused, 2 chars form a byte, 2 bytes for Ox prefix
    // 128 B * 1024 / 32 * 31 = 126.976 B
    expect(result.length).toBe(128 * 1024 / 32 * 31 * 2 + 2);
  });

  test("should reconstruct to a Bloom filter cascade", () => {
    const blobData = reconstructBlobData(trimmedBlobString);
    let [filter, salt] = fromDataHexString(blobData);
    expect(salt.length).toBe(256);
    expect(filter.length).toBe(31);

    // TODO: replace with actual credentialId
    const credentialId = "eip155:1:0x75793097Cd152180D42695756109B3F5fDD4E42f:ea8826dd1f651e38afed3947ebb4626920d54ae880a074c54818fc86604daefbfe0837c15728be07019028ef04897f6aaea269ce8b02b6de686b588455e785d6";
    const isRevoked = !isInBFC(credentialId, filter, salt);
    expect(isRevoked).toBe(false);
  });
});
