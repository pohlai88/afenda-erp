import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uploadRouteCopy } from "@afenda/kernel";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UploadRouteError } from "../src/_object-storage-integration/domain/upload-route.error.shared";
import { createS3ObjectStore } from "../src/s3/domain/object-store.server";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(async () => "https://s3.example/presigned-put"),
}));

const s3Env = {
  region: "ap-southeast-1",
  bucket: "axis-attachments",
  accessKeyId: "key-id",
  secretAccessKey: "secret-key",
  publicUrlBase: undefined,
};

describe("S3 object store", () => {
  beforeEach(() => {
    vi.mocked(getSignedUrl).mockClear();
  });

  const presignInput = {
    pathname: "tenants/org_a/finance/invoice.pdf",
    contentType: "application/pdf",
    sizeBytes: 1024,
    access: "private" as const,
    governance: {
      organizationId: "org_a",
      moduleId: "finance",
      classification: "internal",
      uploadedByAuthUserId: "user_a",
    },
  };

  it("requires SSE-KMS key id for presigned uploads", async () => {
    const store = createS3ObjectStore(s3Env);

    await expect(store.createPresignedUpload!(presignInput)).rejects.toEqual(
      new UploadRouteError(400, uploadRouteCopy.invalidRequest),
    );
  });

  it("presigns PUT with aws:kms and CMK id", async () => {
    const store = createS3ObjectStore(s3Env, {
      sseKmsKeyId: "arn:aws:kms:ap-southeast-1:123456789012:key/test-key",
    });

    const result = await store.createPresignedUpload!(presignInput);

    expect(result).toMatchObject({
      uploadUrl: "https://s3.example/presigned-put",
      pathname: "tenants/org_a/finance/invoice.pdf",
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    const command = vi.mocked(getSignedUrl).mock.calls[0]?.[1];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect((command as PutObjectCommand).input).toMatchObject({
      Bucket: "axis-attachments",
      Key: "tenants/org_a/finance/invoice.pdf",
      ContentType: "application/pdf",
      ServerSideEncryption: "aws:kms",
      SSEKMSKeyId: "arn:aws:kms:ap-southeast-1:123456789012:key/test-key",
    });
  });
});
