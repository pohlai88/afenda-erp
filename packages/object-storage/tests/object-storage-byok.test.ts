import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { KeyManagementPort } from "../src/_object-storage-integration/contracts/key-management.port.shared";
import {
  decryptObjectEnvelope,
  encryptObjectEnvelope,
  usesEnvelopeEncryption,
} from "../src/_object-storage-integration/domain/envelope-encryption.server";
import {
  parseDocumentEncryptionMetadata,
  documentEnvelopeEncryptionSchema,
} from "../src/_object-storage-integration/schemas/document-encryption-metadata.shared";
import { resolveUploadMode } from "../src/_object-storage-integration/domain/create-key-management.server";

function createMockKmsPort(): KeyManagementPort {
  const keys = new Map<string, Uint8Array>();

  return {
    async generateDataKey() {
      const plaintext = randomBytes(32);
      const id = Buffer.from(plaintext).toString("hex");
      keys.set(id, new Uint8Array(plaintext));

      return {
        plaintext,
        wrapped: {
          ciphertext: new TextEncoder().encode(`wrapped:${id}`),
          keyId: "mock-key",
        },
      };
    },

    async decryptDataKey(input) {
      const wrapped = new TextDecoder().decode(input.wrapped.ciphertext);
      const id = wrapped.replace("wrapped:", "");
      const key = keys.get(id);

      if (!key) {
        throw new Error("Missing mock DEK");
      }

      return key;
    },
  };
}

describe("BYOK envelope encryption", () => {
  it("detects envelope mode for customer-managed orgs", () => {
    expect(
      usesEnvelopeEncryption({
        mode: "customer-managed",
        kmsAdapter: "vault-transit",
      }),
    ).toBe(true);
    expect(resolveUploadMode({ mode: "platform", kmsAdapter: null })).toBe(
      "presigned",
    );
    expect(
      resolveUploadMode({
        mode: "customer-managed",
        kmsAdapter: "aws-kms",
      }),
    ).toBe("server");
  });

  it("round-trips encrypt and decrypt with mock KMS", async () => {
    const kms = createMockKmsPort();
    const plaintext = new TextEncoder().encode("payroll-evidence-pdf");

    const encrypted = await encryptObjectEnvelope({
      plaintext,
      organizationId: "org_test",
      pathname: "tenants/org_test/hr/file.pdf",
      kmsAdapter: "vault-transit",
      keyManagement: kms,
    });

    expect(encrypted.ciphertext.byteLength).toBeGreaterThan(plaintext.byteLength);
    documentEnvelopeEncryptionSchema.parse(encrypted.encryption);

    const decrypted = await decryptObjectEnvelope({
      ciphertext: encrypted.ciphertext,
      encryption: encrypted.encryption,
      organizationId: "org_test",
      keyManagement: kms,
    });

    expect(new TextDecoder().decode(decrypted)).toBe("payroll-evidence-pdf");
  });

  it("parses encryption metadata from document registry json", () => {
    const metadata = {
      source: "server-encrypted-upload",
      encryption: {
        mode: "customer-managed",
        adapter: "aws-kms",
        algorithm: "AES-256-GCM",
        iv: "abc",
        wrappedDek: "def",
        keyId: "arn:aws:kms:ap-southeast-1:123456789012:key/abc",
      },
    };

    expect(parseDocumentEncryptionMetadata(metadata)?.adapter).toBe("aws-kms");
  });
});
