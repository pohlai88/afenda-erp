export function formatObjectStorageProviderLabel(
  provider: "vercel-blob" | "r2" | "s3" | null | undefined,
) {
  if (provider === "vercel-blob") {
    return "Vercel Blob";
  }

  if (provider === "r2") {
    return "Cloudflare R2";
  }

  if (provider === "s3") {
    return "Amazon S3 (SSE-KMS)";
  }

  return "Deployment default";
}

export function resolveEffectiveObjectStorageProviderLabel(input: {
  organizationProvider: "vercel-blob" | "r2" | "s3" | null;
  deploymentProvider: "vercel-blob" | "r2" | "s3";
}) {
  return formatObjectStorageProviderLabel(
    input.organizationProvider ?? input.deploymentProvider,
  );
}
