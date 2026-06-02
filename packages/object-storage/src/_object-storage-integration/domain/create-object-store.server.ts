import "server-only";

import type { ObjectStorageEnv } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import { createVercelBlobObjectStore } from "../../blob/domain/object-store.server";
import type { ObjectStorePort } from "../contracts/index";
import { UploadRouteError } from "../domain/upload-route.error.shared";
import { createR2ObjectStore } from "../../r2/domain/object-store.server";

export type ObjectStorageProviderId = "vercel-blob" | "r2";

export type CreateObjectStoreOptions = {
  /** Resolved per-org provider; falls back to deployment env when omitted. */
  organizationProviderId?: ObjectStorageProviderId | null;
  /** Reserved for call-site tracing; does not query DB from this package. */
  organizationId?: string;
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
