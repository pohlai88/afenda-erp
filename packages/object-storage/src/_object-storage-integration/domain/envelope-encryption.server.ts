import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { DocumentEnvelopeEncryptionMetadata } from "../schemas/document-encryption-metadata.shared";
import type {
  KeyManagementPort,
  KmsAdapterId,
  WrappedDataKey,
} from "../contracts/key-management.port.shared";

const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;

function zeroBuffer(buffer: Uint8Array) {
  if (buffer.byteLength === 0) {
    return;
  }

  const view = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  view.fill(0);
}

function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string) {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function wrappedDataKeyFromMetadata(
  metadata: DocumentEnvelopeEncryptionMetadata,
): WrappedDataKey {
  return {
    ciphertext: fromBase64(metadata.wrappedDek),
    keyId: metadata.keyId,
    keyVersion: metadata.keyVersion,
  };
}

export function usesEnvelopeEncryption(input: {
  mode: "platform" | "customer-managed";
  kmsAdapter?: KmsAdapterId | null;
}): boolean {
  return input.mode === "customer-managed" && Boolean(input.kmsAdapter);
}

export async function encryptObjectEnvelope(input: {
  plaintext: Uint8Array;
  organizationId: string;
  pathname: string;
  kmsAdapter: KmsAdapterId;
  keyManagement: KeyManagementPort;
}): Promise<{
  ciphertext: Uint8Array;
  encryption: DocumentEnvelopeEncryptionMetadata;
}> {
  const { plaintext: dekPlaintext, wrapped } =
    await input.keyManagement.generateDataKey({
      organizationId: input.organizationId,
      pathname: input.pathname,
    });

  try {
    const iv = randomBytes(GCM_IV_BYTES);
    const cipher = createCipheriv("aes-256-gcm", Buffer.from(dekPlaintext), iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(input.plaintext)),
      cipher.final(),
      cipher.getAuthTag(),
    ]);

    return {
      ciphertext: new Uint8Array(encrypted),
      encryption: {
        mode: "customer-managed",
        adapter: input.kmsAdapter,
        algorithm: "AES-256-GCM",
        iv: toBase64(iv),
        wrappedDek: toBase64(wrapped.ciphertext),
        keyId: wrapped.keyId,
        keyVersion: wrapped.keyVersion,
      },
    };
  } finally {
    zeroBuffer(dekPlaintext);
  }
}

export async function decryptObjectEnvelope(input: {
  ciphertext: Uint8Array;
  encryption: DocumentEnvelopeEncryptionMetadata;
  organizationId: string;
  keyManagement: KeyManagementPort;
}): Promise<Uint8Array> {
  const wrapped = wrappedDataKeyFromMetadata(input.encryption);
  const dek = await input.keyManagement.decryptDataKey({
    wrapped,
    organizationId: input.organizationId,
  });

  try {
    const iv = fromBase64(input.encryption.iv);
    const payload = Buffer.from(input.ciphertext);

    if (payload.byteLength <= GCM_TAG_BYTES) {
      throw new Error("Encrypted object is too short.");
    }

    const tagStart = payload.byteLength - GCM_TAG_BYTES;
    const authTag = payload.subarray(tagStart);
    const encrypted = payload.subarray(0, tagStart);
    const decipher = createDecipheriv("aes-256-gcm", Buffer.from(dek), iv);
    decipher.setAuthTag(authTag);

    return new Uint8Array(
      Buffer.concat([decipher.update(encrypted), decipher.final()]),
    );
  } finally {
    zeroBuffer(dek);
  }
}
