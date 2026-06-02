export const objectStorageDocumentClassifications = [
  "public",
  "internal",
  "confidential",
  "restricted",
  "highly-restricted",
  "regulated",
] as const;

export type ObjectStorageDocumentClassification =
  (typeof objectStorageDocumentClassifications)[number];

export const objectStorageRetentionClasses = [
  "standard",
  "short-term",
  "legal-hold",
] as const;

export type ObjectStorageRetentionClass =
  (typeof objectStorageRetentionClasses)[number];

export const defaultObjectStorageDocumentClassification = "internal" as const;
export const defaultObjectStorageRetentionClass = "standard" as const;

export const objectStorageSensitiveClassifications = [
  "confidential",
  "restricted",
  "highly-restricted",
  "regulated",
] as const satisfies readonly ObjectStorageDocumentClassification[];

export function isObjectStorageClassificationSensitive(
  classification: ObjectStorageDocumentClassification,
): boolean {
  return (
    objectStorageSensitiveClassifications as readonly string[]
  ).includes(classification);
}

export const objectStorageGovernancePolicy = {
  classifications: [...objectStorageDocumentClassifications],
  retentionClasses: [...objectStorageRetentionClasses],
  defaultClassification: defaultObjectStorageDocumentClassification,
  defaultRetentionClass: defaultObjectStorageRetentionClass,
  classificationRequired: true,
  retentionClassRequired: true,
} as const;
