import { z } from "zod";

export const documentEnvelopeEncryptionSchema = z.object({
  mode: z.literal("customer-managed"),
  adapter: z.enum(["vault-transit", "aws-kms"]),
  algorithm: z.literal("AES-256-GCM"),
  iv: z.string().min(1),
  wrappedDek: z.string().min(1),
  keyId: z.string().min(1),
  keyVersion: z.string().min(1).optional(),
});

export type DocumentEnvelopeEncryptionMetadata = z.infer<
  typeof documentEnvelopeEncryptionSchema
>;

export const documentEncryptionMetadataSchema = z.object({
  encryption: documentEnvelopeEncryptionSchema.optional(),
});

export function parseDocumentEncryptionMetadata(
  metadata: Record<string, unknown> | null | undefined,
): DocumentEnvelopeEncryptionMetadata | null {
  const parsed = documentEncryptionMetadataSchema.safeParse(metadata ?? {});

  if (!parsed.success || !parsed.data.encryption) {
    return null;
  }

  return parsed.data.encryption;
}

export function isCustomerManagedEnvelopeEncrypted(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  return parseDocumentEncryptionMetadata(metadata) !== null;
}
