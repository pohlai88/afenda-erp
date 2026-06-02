"use client";

import type { ObjectStorageAccess } from "../../_object-storage-integration/contracts/index";

export type VercelBlobClientUploadInput = {
  pathname: string;
  file: File;
  access: ObjectStorageAccess;
  handleUploadUrl: string;
  multipart: boolean;
  clientPayload: string;
};

export type VercelBlobClientUploadResult = {
  pathname: string;
  blobUrl: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
};

export async function uploadVercelBlobClient(
  input: VercelBlobClientUploadInput,
): Promise<VercelBlobClientUploadResult> {
  const { upload } = await import("@vercel/blob/client");
  const result = await upload(input.pathname, input.file, {
    access: input.access,
    handleUploadUrl: input.handleUploadUrl,
    multipart: input.multipart,
    clientPayload: input.clientPayload,
  });

  return {
    pathname: result.pathname,
    blobUrl: result.url,
    contentType: result.contentType ?? input.file.type,
    sizeBytes: input.file.size,
    etag: result.etag,
  };
}
