import "server-only";

import { getAwsKmsEnv, getVaultEnv } from "@afenda/config/env";
import type {
  KeyManagementPort,
  ObjectStorageEncryptionContext,
  OrganizationEncryptionSettings,
} from "../contracts/key-management.port.shared";
import { usesEnvelopeEncryption } from "./envelope-encryption.server";
import { createAwsKmsKeyManagement } from "./obj-aws-kms-server";
import { createVaultTransitKeyManagement } from "./obj-vault-transit-server";

export function createKeyManagement(input: {
  organizationId: string;
  settings: OrganizationEncryptionSettings;
}): KeyManagementPort | undefined {
  if (!usesEnvelopeEncryption(input.settings)) {
    return undefined;
  }

  const adapter = input.settings.kmsAdapter;

  if (adapter === "vault-transit") {
    const vaultEnv = getVaultEnv();

    if (!vaultEnv.configured) {
      throw new Error("Vault Transit is not configured for customer-managed encryption.");
    }

    return createVaultTransitKeyManagement({
      env: vaultEnv,
      organizationId: input.organizationId,
      kmsKeyRef: input.settings.kmsKeyRef,
    });
  }

  if (adapter === "aws-kms") {
    const kmsEnv = getAwsKmsEnv();

    if (!kmsEnv.configured) {
      throw new Error("AWS KMS is not configured for customer-managed encryption.");
    }

    return createAwsKmsKeyManagement({
      env: kmsEnv,
      organizationId: input.organizationId,
      kmsKeyRef: input.settings.kmsKeyRef,
    });
  }

  return undefined;
}

export function buildObjectStorageEncryptionContext(input: {
  organizationId: string;
  settings: OrganizationEncryptionSettings;
}): ObjectStorageEncryptionContext {
  const keyManagement = createKeyManagement(input);

  return {
    mode: input.settings.mode,
    kmsAdapter: input.settings.kmsAdapter,
    kmsKeyRef: input.settings.kmsKeyRef,
    keyManagement,
  };
}

export function resolveUploadMode(
  settings: OrganizationEncryptionSettings,
): "presigned" | "server" {
  return usesEnvelopeEncryption(settings) ? "server" : "presigned";
}
