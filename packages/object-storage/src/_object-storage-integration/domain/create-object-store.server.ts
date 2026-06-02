import "server-only";

import type { ObjectStorageEnv } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import { createVercelBlobObjectStore } from "../../blob/domain/object-store.server";
import type { ObjectStorePort } from "../contracts/index";
import type { ObjectStorageEncryptionContext } from "../contracts/key-management.port.shared";
import { UploadRouteError } from "../domain/upload-route.error.shared";
import { createR2ObjectStore } from "../../r2/domain/object-store.server";
import { createS3ObjectStore } from "../../s3/domain/object-store.server";

export type ObjectStorageProviderId = "vercel-blob" | "r2" | "s3";

export type CreateObjectStoreOptions = {
  /** Resolved per-org provider; falls back to deployment env when omitted. */
  organizationProviderId?: ObjectStorageProviderId | null;
  /** Reserved for call-site tracing; does not query DB from this package. */
  organizationId?: string;
  /** BYOK envelope encryption context — resolved at call site from org settings. */
  encryption?: ObjectStorageEncryptionContext;
  /** Per-org CMK for S3 SSE-KMS provider (Phase 3). */
  sseKmsKeyId?: string | null;
};

export function resolveObjectStorageProviderId(
  env: ObjectStorageEnv & { configured: true },
  organizationProviderId?: ObjectStorageProviderId | null,
): ObjectStorageProviderId {
  return organizationProviderId ?? env.provider;
}

export function createObjectStore(
  env: ObjectStorageEnv & { configured: true },
  options?: CreateObjectStoreOptions,
): ObjectStorePort {
  const provider = resolveObjectStorageProviderId(
    env,
    options?.organizationProviderId,
  );

  if (provider === "s3") {
    if (!env.s3) {
      throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
    }

    return createS3ObjectStore(env.s3, {
      sseKmsKeyId: options?.sseKmsKeyId,
    });
  }

  if (provider === "r2") {
    if (!env.r2) {
      throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
    }

    return createR2ObjectStore(env.r2);
  }

  if (!env.vercelBlob?.BLOB_READ_WRITE_TOKEN) {
    throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
  }

  return createVercelBlobObjectStore();
}
