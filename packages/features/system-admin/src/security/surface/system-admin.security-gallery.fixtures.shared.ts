export const systemAdminSecurityGalleryEncryptionSettings = {
  platform: {
    mode: "platform" as const,
    kmsAdapter: null,
    kmsKeyRef: null,
  },
  vaultByok: {
    mode: "customer-managed" as const,
    kmsAdapter: "vault-transit" as const,
    kmsKeyRef: "afenda/org-gallery",
  },
  awsByok: {
    mode: "customer-managed" as const,
    kmsAdapter: "aws-kms" as const,
    kmsKeyRef: "arn:aws:kms:ap-southeast-1:123456789012:key/gallery-key",
  },
};

export const systemAdminSecurityGalleryProviders = {
  deploymentR2: "r2" as const,
  orgS3: "s3" as const,
};
