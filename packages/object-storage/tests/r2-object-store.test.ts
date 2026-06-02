import { uploadRouteCopy } from "@afenda/kernel";
import { describe, expect, it } from "vitest";
import { UploadRouteError } from "../src/_object-storage-integration/domain/upload-route.error.shared";
import {
  headObjectMetadataFromR2Response,
  mapR2HeadObjectError,
} from "../src/r2/domain/object-store.server";
import { addRandomPathSuffix } from "../src/_object-storage-integration/policies/tenant-pathnames.shared";

describe("R2 object store helpers", () => {
  it("maps head responses with required content length", () => {
    expect(
      headObjectMetadataFromR2Response({
        pathname: "tenants/org/finance/invoice.pdf",
        url: "https://cdn.example.com/tenants/org/finance/invoice.pdf",
        contentType: "application/pdf",
        contentLength: 1024,
        etag: '"abc123"',
      }),
    ).toEqual({
      pathname: "tenants/org/finance/invoice.pdf",
      url: "https://cdn.example.com/tenants/org/finance/invoice.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      etag: "abc123",
    });
  });

  it("rejects head responses without content length", () => {
    expect(() =>
      headObjectMetadataFromR2Response({
        pathname: "tenants/org/finance/invoice.pdf",
        url: "https://cdn.example.com/tenants/org/finance/invoice.pdf",
      }),
    ).toThrow(new UploadRouteError(400, uploadRouteCopy.invalidRequest));
  });

  it("maps S3 NotFound to invalid request", () => {
    const error = mapR2HeadObjectError({
      name: "NotFound",
      $metadata: { httpStatusCode: 404 },
    });

    expect(error).toEqual(
      new UploadRouteError(400, uploadRouteCopy.invalidRequest),
    );
  });
});

describe("pathname suffix", () => {
  it("adds collision-safe suffix before extension", () => {
    const result = addRandomPathSuffix("tenants/org/finance/invoice.pdf");
    expect(result).toMatch(/^tenants\/org\/finance\/invoice-[a-f0-9]{8}\.pdf$/);
  });
});
