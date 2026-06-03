import { afterEach, describe, expect, it, vi } from "vitest";
import { moduleIds } from "@afenda/config/module-ids";
import {
  OBJECT_STORAGE_HTTP_ROUTES,
  uploadTenantObject,
} from "../src/client";

const uploadFile = new File(["%PDF-1.7"], "invoice.pdf", {
  type: "application/pdf",
});

function stubBrowserOrigin() {
  vi.stubGlobal("window", {
    location: {
      origin: "https://erp.example",
    },
  });
}

describe("object storage client upload integration", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fails closed when upload config response is malformed", async () => {
    stubBrowserOrigin();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          configured: true,
          provider: "r2",
          pathnamePrefix: "tenants/org_a/finance",
        }),
      ),
    );

    await expect(
      uploadTenantObject({
        moduleId: moduleIds[0],
        file: uploadFile,
        title: "Invoice",
      }),
    ).rejects.toThrow("Object storage upload configuration response is invalid.");
  });

  it("normalizes R2 upload responses before returning metadata", async () => {
    stubBrowserOrigin();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes(OBJECT_STORAGE_HTTP_ROUTES.uploadConfig)) {
        return Response.json({
          configured: true,
          provider: "r2",
          uploadMode: "presigned",
          encryptionMode: "platform",
          pathnamePrefix: "tenants/org_a/finance",
          uploadRoute: OBJECT_STORAGE_HTTP_ROUTES.upload,
          maxSizeBytes: uploadFile.size + 1024,
          contentTypes: ["application/pdf"],
          accept: "application/pdf",
          governance: {},
        });
      }

      if (url === OBJECT_STORAGE_HTTP_ROUTES.upload) {
        const body = JSON.parse(String(init?.body)) as {
          intent: string;
        };

        if (body.intent === "presign") {
          return Response.json({
            provider: "r2",
            uploadUrl: "https://r2.example/upload",
            pathname: "tenants/org_a/finance/invoice-abcd1234.pdf",
            method: "PUT",
            headers: {
              "Content-Type": "application/pdf",
            },
            tokenPayload: "{}",
          });
        }

        return Response.json({
          provider: "r2",
          registered: true,
          pathname: "tenants/org_a/finance/invoice-abcd1234.pdf",
          blobUrl: "https://cdn.example/tenants/org_a/finance/invoice-abcd1234.pdf",
          contentType: "application/pdf",
          sizeBytes: uploadFile.size,
          etag: "etag-a",
        });
      }

      return new Response(null, {
        status: 200,
        headers: {
          etag: '"etag-a"',
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      uploadTenantObject({
        moduleId: moduleIds[0],
        file: uploadFile,
        title: "Invoice",
      }),
    ).resolves.toEqual({
      pathname: "tenants/org_a/finance/invoice-abcd1234.pdf",
      blobUrl: "https://cdn.example/tenants/org_a/finance/invoice-abcd1234.pdf",
      contentType: "application/pdf",
      sizeBytes: uploadFile.size,
      etag: "etag-a",
    });
  });

  it("rejects malformed upload completion responses", async () => {
    stubBrowserOrigin();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes(OBJECT_STORAGE_HTTP_ROUTES.uploadConfig)) {
          return Response.json({
            configured: true,
            provider: "r2",
            uploadMode: "presigned",
            encryptionMode: "platform",
            pathnamePrefix: "tenants/org_a/finance",
            uploadRoute: OBJECT_STORAGE_HTTP_ROUTES.upload,
            maxSizeBytes: uploadFile.size + 1024,
            contentTypes: ["application/pdf"],
            accept: "application/pdf",
            governance: {},
          });
        }

        if (url === OBJECT_STORAGE_HTTP_ROUTES.upload) {
          const body = JSON.parse(String(init?.body)) as { intent: string };

          if (body.intent === "presign") {
            return Response.json({
              provider: "r2",
              uploadUrl: "https://r2.example/upload",
              pathname: "tenants/org_a/finance/invoice-abcd1234.pdf",
              method: "PUT",
              headers: {
                "Content-Type": "application/pdf",
              },
              tokenPayload: "{}",
            });
          }

          return Response.json({
            provider: "r2",
            registered: true,
            pathname: "tenants/org_a/finance/invoice-abcd1234.pdf",
          });
        }

        return new Response(null, { status: 200 });
      }),
    );

    await expect(
      uploadTenantObject({
        moduleId: moduleIds[0],
        file: uploadFile,
        title: "Invoice",
      }),
    ).rejects.toThrow("Object storage upload completion response is invalid.");
  });
});
