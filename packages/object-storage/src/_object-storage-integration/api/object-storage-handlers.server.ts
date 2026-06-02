import "server-only";

import { moduleIds } from "@afenda/config/module-ids";
import { uploadRouteCopy } from "@afenda/kernel";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { z } from "zod";
import { handleVercelBlobUploadPost } from "../../blob/api/upload-handler.server";
import { requireUploadModuleAccess } from "../domain/upload-route-auth.server";
import { OBJECT_STORAGE_HTTP_ROUTES } from "../contracts/index";
import type { GetTenantDocumentForDownload } from "../contracts/index";
import { createObjectStore } from "../domain/create-object-store.server";
import { assertObjectStorageConfigured } from "../domain/object-storage-config.server";
import {
  UploadRouteError,
  getUploadRouteErrorResponse,
} from "../domain/upload-route.error.shared";
import {
  documentUploadAccept,
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "../policies/document-upload-policy.shared";
import {
  assertUploadPathnameMatchesTenant,
  buildTenantObjectPathPrefix,
  formatDownloadContentDisposition,
  MULTIPART_UPLOAD_THRESHOLD_BYTES,
} from "../policies/tenant-pathnames.shared";
import { handleR2UploadPost } from "../../r2/api/upload-handler.server";
import type {
  ObjectStorageHandlerResult,
  ObjectStorageUploadHandlerDeps,
} from "./upload-registration.server";

export type ObjectStorageDownloadHandlerDeps = {
  getTenantDocument: GetTenantDocumentForDownload;
};

export type ObjectStorageHandlerDeps = ObjectStorageUploadHandlerDeps &
  ObjectStorageDownloadHandlerDeps;

export type { ObjectStorageHandlerResult, ObjectStorageUploadHandlerDeps };

const SIGNED_URL_TTL_MS = 5 * 60 * 1000;

export async function handleObjectStorageUploadPost(
  request: Request,
  deps: ObjectStorageUploadHandlerDeps = {},
): Promise<ObjectStorageHandlerResult> {
  const startedAt = Date.now();
  const requestId = getRequestId(request) ?? "unknown";
  const route = OBJECT_STORAGE_HTTP_ROUTES.upload;
  const context = {
    requestId,
    module: "documents",
    operation: "object_storage.client_upload",
  };

  try {
    const objectStorageEnv = assertObjectStorageConfigured();
    const requestBody = (await request.clone().json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    const hasR2Intent =
      requestBody?.intent === "presign" || requestBody?.intent === "complete";

    logServerEvent("info", "Upload route started.", context, { route });

    if (objectStorageEnv.provider === "r2") {
      if (!hasR2Intent) {
        throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
      }

      const result = await handleR2UploadPost(request, {
        requestId,
        route,
        startedAt,
      }, deps);

      logServerEvent("info", "Upload route completed.", context, {
        route,
        durationMs: Date.now() - startedAt,
        status: result.status,
      });

      return result;
    }

    if (hasR2Intent) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    const result = await handleVercelBlobUploadPost(request, {
      requestId,
      route,
      startedAt,
    }, deps);

    logServerEvent("info", "Upload route completed.", context, {
      route,
      durationMs: Date.now() - startedAt,
      status: result.status,
    });

    return result;
  } catch (error) {
    const response = getUploadRouteErrorResponse(error);

    logServerEvent("error", "Upload route failed.", context, {
      route,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      status: response.status,
      body: { error: response.message },
    };
  }
}

const moduleIdSchema = z.enum(moduleIds);

export async function handleObjectStorageUploadConfigGet(
  request: Request,
): Promise<ObjectStorageHandlerResult> {
  try {
    const objectStorageEnv = assertObjectStorageConfigured();
    const url = new URL(request.url);
    const moduleId = moduleIdSchema.parse(url.searchParams.get("moduleId"));
    const { organization } = await requireUploadModuleAccess(moduleId, "upload");

    return {
      status: 200,
      body: {
        configured: true,
        provider: objectStorageEnv.provider,
        pathnamePrefix: buildTenantObjectPathPrefix({
          organizationId: organization.id,
          moduleId,
        }),
        uploadRoute: OBJECT_STORAGE_HTTP_ROUTES.upload,
        maxSizeBytes: documentUploadMaxSizeBytes,
        contentTypes: [...documentUploadContentTypes],
        accept: documentUploadAccept,
        ...(objectStorageEnv.provider === "vercel-blob"
          ? { multipartThresholdBytes: MULTIPART_UPLOAD_THRESHOLD_BYTES }
          : {}),
      },
    };
  } catch (error) {
    if (error instanceof UploadRouteError && error.status === 503) {
      const configuredResponse = getUploadRouteErrorResponse(error);

      return {
        status: configuredResponse.status,
        body: {
          configured: false,
          error: configuredResponse.message,
        },
      };
    }

    const response = getUploadRouteErrorResponse(error);

    return {
      status: response.status,
      body: {
        configured: true,
        authorized: false,
        error: response.message,
      },
    };
  }
}

export async function handleObjectStorageDocumentDownloadGet(
  input: {
    request: Request;
    documentId: string;
  },
  deps: ObjectStorageDownloadHandlerDeps,
): Promise<ObjectStorageHandlerResult> {
  const startedAt = Date.now();
  const requestId = getRequestId(input.request) ?? "unknown";
  const route = OBJECT_STORAGE_HTTP_ROUTES.documentDownload;

  try {
    const objectStorageEnv = assertObjectStorageConfigured();
    const store = createObjectStore(objectStorageEnv);

    const moduleId = moduleIdSchema.parse(
      new URL(input.request.url).searchParams.get("moduleId"),
    );
    const { organization } = await requireUploadModuleAccess(
      moduleId,
      "download",
    );
    const document = await deps.getTenantDocument({
      organizationId: organization.id,
      documentId: input.documentId,
      moduleId,
    });

    if (!document) {
      return {
        status: 404,
        body: { error: uploadRouteCopy.documentNotFound },
      };
    }

    assertUploadPathnameMatchesTenant({
      pathname: document.pathname,
      organizationId: organization.id,
      moduleId: document.moduleId,
    });

    const validUntil = Date.now() + SIGNED_URL_TTL_MS;
    const contentDisposition = formatDownloadContentDisposition(document.title);
    const signed = await store.getSignedDownloadUrl({
      pathname: document.pathname,
      access: document.access,
      contentDisposition,
      validUntilMs: validUntil,
    });

    logServerEvent(
      "info",
      "Document download signed URL issued.",
      {
        requestId,
        organizationId: organization.id,
        module: moduleId,
        operation: "object_storage.download_signed_redirect",
      },
      {
        route,
        durationMs: Date.now() - startedAt,
        documentId: document.id,
        pathname: document.pathname,
        validUntilMs: validUntil,
        provider: objectStorageEnv.provider,
      },
    );

    return {
      status: 302,
      redirect: signed.url,
    };
  } catch (error) {
    if (error instanceof UploadRouteError) {
      return {
        status: error.status,
        body: { error: error.message },
      };
    }

    const response = getUploadRouteErrorResponse(error);

    logServerEvent(
      "error",
      "Document download failed.",
      {
        requestId,
        module: "documents",
        operation: "object_storage.download_signed_redirect",
      },
      {
        route,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
    );

    return {
      status: response.status,
      body: { error: response.message },
    };
  }
}
