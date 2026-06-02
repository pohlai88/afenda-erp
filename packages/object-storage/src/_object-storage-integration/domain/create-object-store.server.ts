import "server-only";

import type { ObjectStorageEnv } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import { createVercelBlobObjectStore } from "../../blob/domain/object-store.server";
import type { ObjectStorePort } from "../contracts/index";
import { UploadRouteError } from "../domain/upload-route.error.shared";
import { createR2ObjectStore } from "../../r2/domain/object-store.server";

export function createObjectStore(
  env: ObjectStorageEnv & { configured: true },
): ObjectStorePort {
  if (env.provider === "r2") {
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
