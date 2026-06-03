import { z } from "zod";

const awsKmsArnSchema = z
  .string()
  .trim()
  .regex(/^arn:aws:kms:[a-z0-9-]+:\d{12}:key\/[\w-]+$/, {
    message: "Enter a valid AWS KMS CMK ARN.",
  });

export const objectStorageEncryptionModePreferenceSchema = z.enum([
  "platform",
  "customer-managed",
]);

export const objectStorageKmsAdapterPreferenceSchema = z.enum([
  "vault-transit",
  "aws-kms",
]);

export const updateOrganizationEncryptionSettingsInputSchema = z
  .object({
    encryptionMode: objectStorageEncryptionModePreferenceSchema,
    kmsAdapter: z.enum(["", "vault-transit", "aws-kms"]),
    kmsKeyRef: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    if (value.encryptionMode === "platform") {
      return;
    }

    if (value.kmsAdapter !== "vault-transit" && value.kmsAdapter !== "aws-kms") {
      ctx.addIssue({
        code: "custom",
        message: "Select a KMS adapter for customer-managed encryption.",
        path: ["kmsAdapter"],
      });
      return;
    }

    if (value.kmsAdapter === "aws-kms") {
      const parsedArn = awsKmsArnSchema.safeParse(value.kmsKeyRef);

      if (!parsedArn.success) {
        ctx.addIssue({
          code: "custom",
          message: parsedArn.error.issues[0]?.message ?? "Invalid CMK ARN.",
          path: ["kmsKeyRef"],
        });
      }
    }
  });

export type UpdateOrganizationEncryptionSettingsInput = z.infer<
  typeof updateOrganizationEncryptionSettingsInputSchema
>;

export function mapEncryptionSettingsToColumns(
  input: UpdateOrganizationEncryptionSettingsInput,
): {
  encryptionMode: "platform" | "customer-managed";
  kmsAdapter: "vault-transit" | "aws-kms" | null;
  kmsKeyRef: string | null;
} {
  if (input.encryptionMode === "platform") {
    return {
      encryptionMode: "platform",
      kmsAdapter: null,
      kmsKeyRef: null,
    };
  }

  const kmsAdapter =
    input.kmsAdapter === "vault-transit" || input.kmsAdapter === "aws-kms"
      ? input.kmsAdapter
      : null;

  const kmsKeyRef = input.kmsKeyRef.trim() || null;

  return {
    encryptionMode: "customer-managed",
    kmsAdapter,
    kmsKeyRef,
  };
}

export function formatEncryptionModeLabel(
  mode: "platform" | "customer-managed",
) {
  return mode === "customer-managed" ? "Customer-managed (envelope)" : "Platform";
}

export function formatKmsAdapterLabel(
  adapter: "vault-transit" | "aws-kms" | null | undefined,
) {
  if (adapter === "vault-transit") {
    return "Vault Transit";
  }

  if (adapter === "aws-kms") {
    return "AWS KMS";
  }

  return "—";
}
