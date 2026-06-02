import "server-only";

import { moduleIds } from "@afenda/config/module-ids";
import { getTenantDocument } from "@afenda/db";
import { uploadRouteCopy } from "@afenda/kernel";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { z } from "zod";
import { requireUploadModuleAccess } from "../auth/upload-route-auth.server";
import { OBJECT_STORAGE_HTTP_ROUTES } from "../contracts/index";
import type { UploadRegistrationInput } from "../contracts/index";
import {
  assertObjectStorageConfigured,
  resolveUploadedDocumentSize,
  resolveVercelBlobCallbackUrl,
} from "../env/object-storage-config.server";
import {
  UploadRouteError,
  getUploadRouteErrorResponse,
} from "../errors/upload-route.error.shared";
import {
  documentUploadAccept,
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "../policies/document-upload-policy.shared";
import {
  assertUploadPathnameMatchesTenant,
  addRandomPathSuffix,
  buildTenantObjectPathPrefix,
  formatDownloadContentDisposition,
  MULTIPART_UPLOAD_THRESHOLD_BYTES,
} from "../policies/tenant-pathnames.shared";
import { createObjectStore } from "../providers/create-object-store.server";
import {
  assertUploadTokenMatchesSession,
  r2CompleteBodySchema,
  r2PresignBodySchema,
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "../schemas/upload-payload.shared";

const SIGNED_URL_TTL_MS = 5 * 60 * 1000;

export type ObjectStorageHandlerResult = {
  status: number;
  body?: unknown;
  redirect?: string;
};

function parseUploadTokenPayload(tokenPayload: string | null | undefined) {
  if (!tokenPayload) {
    throw new UploadRouteError(400, uploadRouteCopy.missingTokenPayload);
  }

  return uploadPayloadSchema
    .extend({
      organizationId: z.string().min(1),
      uploadedByAuthUserId: z.string().min(1),
      pathname: z.string().min(1).optional(),
    })
    .parse(JSON.parse(tokenPayload)) satisfies UploadTokenPayload;
}

function storedContentTypeMatchesDeclared(
  storedContentType: string | undefined,
  declaredContentType: string,
) {
  if (!storedContentType || storedContentType === "application/octet-stream") {
    return true;
  }

  return storedContentType === declaredContentType;
}

function buildStoredObjectResult(input: {
  pathname: string;
  blobUrl: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
}) {
  return {
    pathname: input.pathname,
    blobUrl: input.blobUrl,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    etag: input.etag,
  };
}

export type ObjectStorageUploadHandlerDeps = {
  registerUploadedDocument?: (
    input: UploadRegistrationInput,
  ) => Promise<void>;
};

async function registerUploadedDocument(input: {
  deps: ObjectStorageUploadHandlerDeps;
  requestId: string;
  route: string;
  startedAt: number;
  parsedPayload: UploadTokenPayload;
  organization: { id: string };
  session: { id: string };
  pathname: string;
  blobUrl: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
  source: string;
}) {
  if (!input.deps.registerUploadedDocument) {
    throw new UploadRouteError(503, uploadRouteCopy.uploadFailed);
  }

  await input.deps.registerUploadedDocument({
    organizationId: input.organization.id,
    moduleId: input.parsedPayload.moduleId,
    ownerEntityId: input.parsedPayload.ownerEntityId,
    title: input.parsedPayload.title,
    blobUrl: input.blobUrl,
    pathname: input.pathname,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    access: input.parsedPayload.access,
    blobEtag: input.etag,
    uploadedByAuthUserId: input.session.id,
    metadata: {
      source: input.source,
      declaredContentType: input.parsedPayload.contentType,
      declaredSizeBytes: input.parsedPayload.sizeBytes,
    },
  });

  logServerEvent(
    "info",
    "Upload completed and registered.",
    {
      requestId: input.requestId,
      organizationId: input.organization.id,
      userId: input.session.id,
      module: input.parsedPayload.moduleId,
      operation: "object_storage.register_upload",
    },
    {
      route: input.route,
      durationMs: Date.now() - input.startedAt,
      pathname: input.pathname,
      sizeBytes: input.sizeBytes,
    },
  );
}

async function handleVercelBlobUploadPost(
  request: Request,
  context: {
    requestId: string;
    route: string;
    startedAt: number;
  },
  deps: ObjectStorageUploadHandlerDeps,
): Promise<ObjectStorageHandlerResult> {
  const objectStorageEnv = assertObjectStorageConfigured();

  if (
    objectStorageEnv.provider !== "vercel-blob" ||
    !objectStorageEnv.vercelBlob?.BLOB_READ_WRITE_TOKEN
  ) {
    throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
  }

  const blobEnv = objectStorageEnv.vercelBlob;
  const accessByModule = new Map<
    UploadTokenPayload["moduleId"],
    Awaited<ReturnType<typeof requireUploadModuleAccess>>
  >();

  async function getUploadAccess(moduleId: UploadTokenPayload["moduleId"]) {
    const cached = accessByModule.get(moduleId);
    if (cached) {
      return cached;
    }

    const access = await requireUploadModuleAccess(moduleId, "upload");
    accessByModule.set(moduleId, access);
    return access;
  }

  const body = (await request.json()) as HandleUploadBody;
  const jsonResponse = await handleUpload({
    body,
    request,
    token: blobEnv.BLOB_READ_WRITE_TOKEN,
    onBeforeGenerateToken: async (pathname, clientPayload) => {
      const parsedPayload = uploadPayloadSchema.parse(
        JSON.parse(clientPayload ?? "{}"),
      );
      const { session, organization } = await getUploadAccess(
        parsedPayload.moduleId,
      );

      assertUploadPathnameMatchesTenant({
        pathname,
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
      });

      logServerEvent(
        "info",
        "Upload token issued.",
        {
          requestId: context.requestId,
          organizationId: organization.id,
          userId: session.id,
          module: parsedPayload.moduleId,
          operation: "object_storage.issue_upload_token",
        },
        {
          route: context.route,
          contentType: parsedPayload.contentType,
          sizeBytes: parsedPayload.sizeBytes,
          pathname,
        },
      );

      return {
        addRandomSuffix: true,
        allowedContentTypes: [...documentUploadContentTypes],
        maximumSizeInBytes: documentUploadMaxSizeBytes,
        callbackUrl: resolveVercelBlobCallbackUrl(request, blobEnv),
        tokenPayload: JSON.stringify({
          ...parsedPayload,
          organizationId: organization.id,
          uploadedByAuthUserId: session.id,
          pathname,
        } satisfies UploadTokenPayload),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const parsedPayload = parseUploadTokenPayload(tokenPayload);
      const { organization, session } = await getUploadAccess(
        parsedPayload.moduleId,
      );

      assertUploadTokenMatchesSession(parsedPayload, organization, session);
      assertUploadPathnameMatchesTenant({
        pathname: blob.pathname,
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
      });

      const sizeBytes = resolveUploadedDocumentSize({
        declaredSizeBytes: parsedPayload.sizeBytes,
        blob,
      });

      if (parsedPayload.registerTenantDocument === false) {
        logServerEvent(
          "info",
          "Upload completed without ERP registry write.",
          {
            requestId: context.requestId,
            organizationId: organization.id,
            userId: session.id,
            module: parsedPayload.moduleId,
            operation: "object_storage.upload_only",
          },
          {
            route: context.route,
            pathname: blob.pathname,
            sizeBytes,
          },
        );
        return;
      }

      await registerUploadedDocument({
        deps,
        requestId: context.requestId,
        route: context.route,
        startedAt: context.startedAt,
        parsedPayload,
        organization,
        session,
        pathname: blob.pathname,
        blobUrl: blob.url,
        contentType: blob.contentType ?? parsedPayload.contentType,
        sizeBytes,
        etag: blob.etag,
        source: "vercel-blob-client-upload",
      });
    },
  });

  return {
    status: 200,
    body: jsonResponse,
  };
}

async function handleR2UploadPost(
  request: Request,
  context: {
    requestId: string;
    route: string;
    startedAt: number;
  },
  deps: ObjectStorageUploadHandlerDeps,
): Promise<ObjectStorageHandlerResult> {
  const objectStorageEnv = assertObjectStorageConfigured();
  const store = createObjectStore(objectStorageEnv);

  if (!store.createPresignedUpload) {
    throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
  }

  const body = (await request.json()) as Record<string, unknown>;

  if (body.intent === "presign") {
    const parsed = r2PresignBodySchema.parse(body);
    const parsedPayload = uploadPayloadSchema.parse(
      JSON.parse(parsed.clientPayload),
    );
    const { session, organization } = await requireUploadModuleAccess(
      parsedPayload.moduleId,
      "upload",
    );

    assertUploadPathnameMatchesTenant({
      pathname: parsed.pathname,
      organizationId: organization.id,
      moduleId: parsedPayload.moduleId,
    });

    if (
      parsedPayload.access === "public" &&
      !objectStorageEnv.r2?.publicUrlBase
    ) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    const storagePathname = addRandomPathSuffix(parsed.pathname);

    const presigned = await store.createPresignedUpload({
      pathname: storagePathname,
      contentType: parsedPayload.contentType,
      sizeBytes: parsedPayload.sizeBytes,
      access: parsedPayload.access,
    });

    const tokenPayload = JSON.stringify({
      ...parsedPayload,
      organizationId: organization.id,
      uploadedByAuthUserId: session.id,
      pathname: storagePathname,
    } satisfies UploadTokenPayload);

    logServerEvent(
      "info",
      "R2 upload presign issued.",
      {
        requestId: context.requestId,
        organizationId: organization.id,
        userId: session.id,
        module: parsedPayload.moduleId,
        operation: "object_storage.r2_presign",
      },
      {
        route: context.route,
        pathname: storagePathname,
      },
    );

    return {
      status: 200,
      body: {
        provider: "r2",
        ...presigned,
        pathname: storagePathname,
        tokenPayload,
      },
    };
  }

  if (body.intent === "complete") {
    const parsed = r2CompleteBodySchema.parse(body);
    const parsedPayload = parseUploadTokenPayload(parsed.tokenPayload);
    const { organization, session } = await requireUploadModuleAccess(
      parsedPayload.moduleId,
      "upload",
    );

    assertUploadTokenMatchesSession(parsedPayload, organization, session);

    if (!parsedPayload.pathname) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    if (parsed.pathname !== parsedPayload.pathname) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    assertUploadPathnameMatchesTenant({
      pathname: parsed.pathname,
      organizationId: organization.id,
      moduleId: parsedPayload.moduleId,
    });

    const stored = await store.headObject(parsed.pathname);

    if (stored.sizeBytes !== parsedPayload.sizeBytes) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    if (
      !storedContentTypeMatchesDeclared(
        stored.contentType,
        parsedPayload.contentType,
      )
    ) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    if (parsed.etag && stored.etag && parsed.etag !== stored.etag) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    const storedResult = buildStoredObjectResult({
      pathname: stored.pathname,
      blobUrl: stored.url,
      contentType: stored.contentType ?? parsedPayload.contentType,
      sizeBytes: stored.sizeBytes,
      etag: stored.etag,
    });

    if (parsedPayload.registerTenantDocument === false) {
      return {
        status: 200,
        body: {
          provider: "r2",
          registered: false,
          ...storedResult,
        },
      };
    }

    await registerUploadedDocument({
      deps,
      requestId: context.requestId,
      route: context.route,
      startedAt: context.startedAt,
      parsedPayload,
      organization,
      session,
      pathname: stored.pathname,
      blobUrl: stored.url,
      contentType: storedResult.contentType,
      sizeBytes: stored.sizeBytes,
      etag: stored.etag,
      source: "r2-presigned-upload",
    });

    return {
      status: 200,
      body: {
        provider: "r2",
        registered: true,
        ...storedResult,
      },
    };
  }

  throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
}

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

export async function handleObjectStorageDocumentDownloadGet(input: {
  request: Request;
  documentId: string;
}): Promise<ObjectStorageHandlerResult> {
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
    const document = await getTenantDocument({
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
      access: document.access as "public" | "private",
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
