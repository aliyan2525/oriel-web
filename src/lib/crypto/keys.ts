import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/** A provider key encrypted with AES-256-GCM. Only the server can open it. */
export type Sealed = { ciphertext: string; iv: string; tag: string };

function keyFromEnv(): Buffer {
  const raw = process.env.KEY_ENCRYPTION_SECRET;
  if (!raw) throw new Error("KEY_ENCRYPTION_SECRET is not set");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("KEY_ENCRYPTION_SECRET must decode to 32 bytes");
  return key;
}

/** Encrypts a key. A fresh random IV is used every time, so equal keys seal differently. */
export function sealKey(plaintext: string, key: Buffer = keyFromEnv()): Sealed {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

/** Decrypts a key. Throws if the data was altered or the key is wrong. */
export function openKey(sealed: Sealed, key: Buffer = keyFromEnv()): string {
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(sealed.iv, "base64"));
  decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

/** The last four characters, shown in the UI so people can recognise a key without seeing it. */
export function lastFour(secret: string): string {
  return secret.slice(-4);
}
