import "server-only";

import type { ObjectStorageS3Env } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import {
  DeleteObjectCommand,
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
import {
  headObjectMetadataFromR2Response,
  mapR2HeadObjectError,
} from "../../r2/domain/object-store.server";
import { R2_PRESIGN_EXPIRES_SECONDS } from "../../r2/domain/presign.shared";

function createS3Client(s3: ObjectStorageS3Env) {
  return new S3Client({
    region: s3.region,
    credentials: {
      accessKeyId: s3.accessKeyId,
      secretAccessKey: s3.secretAccessKey,
    },
  });
}

function resolveS3ObjectUrl(pathname: string, s3: ObjectStorageS3Env) {
  if (s3.publicUrlBase) {
    return `${s3.publicUrlBase.replace(/\/$/, "")}/${pathname}`;
  }

  return `https://${s3.bucket}.s3.${s3.region}.amazonaws.com/${pathname}`;
}

export type CreateS3ObjectStoreOptions = {
  sseKmsKeyId?: string | null;
};

export function createS3ObjectStore(
  s3: ObjectStorageS3Env,
  options?: CreateS3ObjectStoreOptions,
): ObjectStorePort {
  const client = createS3Client(s3);
  const sseKmsKeyId = options?.sseKmsKeyId?.trim();

  return {
    providerId: "s3",

    async createPresignedUpload(
      input: PresignedUploadInput,
    ): Promise<PresignedUploadResult> {
      if (!sseKmsKeyId) {
        throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
      }

      const command = new PutObjectCommand({
        Bucket: s3.bucket,
        Key: input.pathname,
        ContentType: input.contentType,
        ServerSideEncryption: "aws:kms",
        SSEKMSKeyId: sseKmsKeyId,
        ...(input.governance
          ? {
              Metadata: {
                organizationId: input.governance.organizationId,
                moduleId: input.governance.moduleId,
                classification: input.governance.classification,
                uploadedBy: input.governance.uploadedByAuthUserId,
              },
            }
          : {}),
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
            Bucket: s3.bucket,
            Key: pathname,
          }),
        );

        return headObjectMetadataFromR2Response({
          pathname,
          url: resolveS3ObjectUrl(pathname, s3),
          contentType: response.ContentType,
          contentLength: response.ContentLength,
          etag: response.ETag,
        });
      } catch (error) {
        throw mapR2HeadObjectError(error);
      }
    },

    async readObjectPrefix(pathname: string, maxBytes: number) {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: s3.bucket,
          Key: pathname,
          Range: `bytes=0-${Math.max(0, maxBytes - 1)}`,
        }),
      );

      const body = response.Body;
      if (!body) {
        throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
      }

      return new Uint8Array(await body.transformToByteArray());
    },

    async getSignedDownloadUrl(
      input: SignedDownloadInput,
    ): Promise<SignedDownloadResult> {
      if (input.access === "public" && s3.publicUrlBase) {
        return {
          url: resolveS3ObjectUrl(input.pathname, s3),
          validUntilMs: input.validUntilMs,
        };
      }

      const command = new GetObjectCommand({
        Bucket: s3.bucket,
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

    async deleteObject(input: { pathname: string }) {
      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: s3.bucket,
            Key: input.pathname,
          }),
        );
      } catch (error) {
        throw mapR2HeadObjectError(error);
      }
    },
  };
}
