import "server-only";

import type { ObjectStorageR2Env } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  ObjectStorePort,
  PresignedUploadInput,
  PresignedUploadResult,
  SignedDownloadInput,
  SignedDownloadResult,
  StoredObjectMetadata,
} from "../../_object-storage-integration/contracts/index";
import { UploadRouteError } from "../../_object-storage-integration/domain/upload-route.error.shared";
import { R2_PRESIGN_EXPIRES_SECONDS } from "./presign.shared";

function createR2Client(r2: ObjectStorageR2Env) {
  return new S3Client({
    region: "auto",
    endpoint: r2.endpoint,
    credentials: {
      accessKeyId: r2.accessKeyId,
      secretAccessKey: r2.secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function resolveR2ObjectUrl(pathname: string, r2: ObjectStorageR2Env) {
  if (r2.publicUrlBase) {
    return `${r2.publicUrlBase.replace(/\/$/, "")}/${pathname}`;
  }

  return `${r2.endpoint.replace(/\/$/, "")}/${r2.bucket}/${pathname}`;
}

export function headObjectMetadataFromR2Response(input: {
  pathname: string;
  url: string;
  contentType?: string;
  contentLength?: number;
  etag?: string;
}): StoredObjectMetadata {
  if (input.contentLength == null) {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  return {
    pathname: input.pathname,
    url: input.url,
    contentType: input.contentType,
    sizeBytes: input.contentLength,
    etag: input.etag?.replaceAll('"', ""),
  };
}

export function mapR2HeadObjectError(error: unknown): UploadRouteError {
  if (error instanceof UploadRouteError) {
    return error;
  }

  const candidate = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  if (
    candidate.name === "NotFound" ||
    candidate.$metadata?.httpStatusCode === 404
  ) {
    return new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  return new UploadRouteError(500, uploadRouteCopy.uploadFailed);
}

export function createR2ObjectStore(r2: ObjectStorageR2Env): ObjectStorePort {
  const client = createR2Client(r2);

  return {
    providerId: "r2",

    async createPresignedUpload(
      input: PresignedUploadInput,
    ): Promise<PresignedUploadResult> {
      const command = new PutObjectCommand({
        Bucket: r2.bucket,
        Key: input.pathname,
        ContentType: input.contentType,
      });

      const uploadUrl = await getSignedUrl(client, command, {
        expiresIn: R2_PRESIGN_EXPIRES_SECONDS,
      });

      return {
        uploadUrl,
        pathname: input.pathname,
        method: "PUT",
        headers: {
          "Content-Type": input.contentType,
        },
      };
    },

    async headObject(pathname: string): Promise<StoredObjectMetadata> {
      try {
        const response = await client.send(
          new HeadObjectCommand({
            Bucket: r2.bucket,
            Key: pathname,
          }),
        );

        return headObjectMetadataFromR2Response({
          pathname,
          url: resolveR2ObjectUrl(pathname, r2),
          contentType: response.ContentType,
          contentLength: response.ContentLength,
          etag: response.ETag,
        });
      } catch (error) {
        throw mapR2HeadObjectError(error);
      }
    },

    async getSignedDownloadUrl(
      input: SignedDownloadInput,
    ): Promise<SignedDownloadResult> {
      if (input.access === "public" && r2.publicUrlBase) {
        return {
          url: resolveR2ObjectUrl(input.pathname, r2),
          validUntilMs: input.validUntilMs,
        };
      }

      const command = new GetObjectCommand({
        Bucket: r2.bucket,
        Key: input.pathname,
        ResponseContentDisposition: input.contentDisposition,
      });

      const expiresIn = Math.max(
        1,
        Math.floor((input.validUntilMs - Date.now()) / 1000),
      );
      const url = await getSignedUrl(client, command, { expiresIn });

      return {
        url,
        validUntilMs: input.validUntilMs,
      };
    },
  };
}
