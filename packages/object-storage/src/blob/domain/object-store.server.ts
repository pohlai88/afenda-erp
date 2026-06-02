import "server-only";

import type { BlobEnv } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import { del, issueSignedToken, presignUrl } from "@vercel/blob";
import type {
  ObjectStorePort,
  SignedDownloadInput,
  SignedDownloadResult,
  StoredObjectMetadata,
} from "../../_object-storage-integration/contracts/index";
import { UploadRouteError } from "../../_object-storage-integration/domain/upload-route.error.shared";

export function createVercelBlobObjectStore(): ObjectStorePort {
  return {
    providerId: "vercel-blob",

    async headObject(_pathname: string): Promise<StoredObjectMetadata> {
      throw new UploadRouteError(
        501,
        "Vercel Blob headObject is handled by the client upload callback.",
      );
    },

    async getSignedDownloadUrl(
      input: SignedDownloadInput,
    ): Promise<SignedDownloadResult> {
      const signedToken = await issueSignedToken({
        pathname: input.pathname,
        operations: ["get"],
        validUntil: input.validUntilMs,
      });

      const { presignedUrl } = await presignUrl(signedToken, {
        operation: "get",
        pathname: input.pathname,
        access: input.access,
        validUntil: input.validUntilMs,
      });

      const redirectUrl = new URL(presignedUrl);
      redirectUrl.searchParams.set(
        "response-content-disposition",
        input.contentDisposition,
      );

      return {
        url: redirectUrl.toString(),
        validUntilMs: input.validUntilMs,
      };
    },

    async deleteObject(input: { pathname: string; blobUrl?: string }) {
      const blobUrl = input.blobUrl?.trim();
      if (!blobUrl) {
        throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
      }

      await del(blobUrl);
    },
  };
}

export type VercelBlobUploadEnv = BlobEnv & {
  BLOB_READ_WRITE_TOKEN: string;
};
