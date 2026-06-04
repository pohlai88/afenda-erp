import { describe, expect, it } from "vitest";
import {
  mapEncryptionSettingsToColumns,
  updateOrganizationEncryptionSettingsInputSchema,
} from "../../src/features/security/sys-object-storage-encryption.schema";

describe("organization encryption settings schema", () => {
  it("accepts platform mode without adapter", () => {
    const parsed = updateOrganizationEncryptionSettingsInputSchema.parse({
      encryptionMode: "platform",
      kmsAdapter: "",
      kmsKeyRef: "",
    });

    expect(mapEncryptionSettingsToColumns(parsed)).toEqual({
      encryptionMode: "platform",
      kmsAdapter: null,
      kmsKeyRef: null,
    });
  });

  it("requires valid AWS CMK ARN for aws-kms adapter", () => {
    expect(() =>
      updateOrganizationEncryptionSettingsInputSchema.parse({
        encryptionMode: "customer-managed",
        kmsAdapter: "aws-kms",
        kmsKeyRef: "not-an-arn",
      }),
    ).toThrow();
  });

  it("maps vault customer-managed settings", () => {
    const parsed = updateOrganizationEncryptionSettingsInputSchema.parse({
      encryptionMode: "customer-managed",
      kmsAdapter: "vault-transit",
      kmsKeyRef: "afenda/org-custom",
    });

    expect(mapEncryptionSettingsToColumns(parsed)).toEqual({
      encryptionMode: "customer-managed",
      kmsAdapter: "vault-transit",
      kmsKeyRef: "afenda/org-custom",
    });
  });
});
