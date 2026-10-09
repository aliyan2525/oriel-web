import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { lastFour, openKey, sealKey } from "./keys";

const key = randomBytes(32);

describe("sealKey and openKey", () => {
  it("round-trips a key", () => {
    expect(openKey(sealKey("sk-test-1234567890", key), key)).toBe("sk-test-1234567890");
  });

  it("never stores the plaintext", () => {
    const sealed = sealKey("sk-test-1234567890", key);
    expect(JSON.stringify(sealed)).not.toContain("sk-test");
  });

  it("uses a fresh IV, so the same key seals differently each time", () => {
    const a = sealKey("sk-same", key);
    const b = sealKey("sk-same", key);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it("refuses data that was altered", () => {
    const sealed = sealKey("sk-test-1234567890", key);
    const bytes = Buffer.from(sealed.ciphertext, "base64");
    bytes[0] ^= 0xff;
    expect(() => openKey({ ...sealed, ciphertext: bytes.toString("base64") }, key)).toThrow();
  });

  it("refuses to open with the wrong key", () => {
    const sealed = sealKey("sk-test-1234567890", key);
    expect(() => openKey(sealed, randomBytes(32))).toThrow();
  });
});

describe("lastFour", () => {
  it("returns only the final four characters", () => {
    expect(lastFour("sk-live-abcdef9876")).toBe("9876");
  });
});
