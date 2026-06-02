/**
 * BYOK / customer-managed envelope encryption port (ARCH-OS-1001 §12).
 * Application-layer envelope encryption before PUT to R2; storage-native SSE-KMS
 * uses the separate `s3` provider slice (Phase 3).
 */
export type ObjectStorageEncryptionMode = "platform" | "customer-managed";

export type KmsAdapterId = "vault-transit" | "aws-kms";

export type WrappedDataKey = {
  ciphertext: Uint8Array;
  keyId: string;
  keyVersion?: string;
};

export type KeyManagementPort = {
  generateDataKey(input: {
    organizationId: string;
    pathname: string;
  }): Promise<{
    plaintext: Uint8Array;
    wrapped: WrappedDataKey;
  }>;
  decryptDataKey(input: {
    wrapped: WrappedDataKey;
    organizationId: string;
  }): Promise<Uint8Array>;
};

export type OrganizationEncryptionSettings = {
  mode: ObjectStorageEncryptionMode;
  kmsAdapter?: KmsAdapterId | null;
  kmsKeyRef?: string | null;
};

export type ObjectStorageEncryptionContext = {
  mode: ObjectStorageEncryptionMode;
  kmsAdapter?: KmsAdapterId | null;
  kmsKeyRef?: string | null;
  keyManagement?: KeyManagementPort;
};
