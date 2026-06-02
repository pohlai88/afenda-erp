import "server-only";

import { uploadRouteCopy } from "@afenda/kernel";
import { logServerEvent } from "@afenda/observability";
import type {
  ObjectStorageHandlerResult,
  ObjectStorageUploadHandlerDeps,
} from "../../_object-storage-integration/api/upload-registration.server";
import {
  buildStoredObjectResult,
  parseUploadTokenPayload,
  registerUploadedDocument,
  storedContentTypeMatchesDeclared,
} from "../../_object-storage-integration/api/upload-registration.server";
import { requireUploadModuleAccess } from "../../_object-storage-integration/domain/upload-route-auth.server";
import { createObjectStore } from "../../_object-storage-integration/domain/create-object-store.server";
import { assertObjectStorageConfigured } from "../../_object-storage-integration/domain/object-storage-config.server";
import { UploadRouteError } from "../../_object-storage-integration/domain/upload-route.error.shared";
import {
  addRandomPathSuffix,
  assertUploadPathnameMatchesTenant,
} from "../../_object-storage-integration/policies/tenant-pathnames.shared";
import {
  assertUploadTokenMatchesSession,
  r2CompleteBodySchema,
  r2PresignBodySchema,
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "../../_object-storage-integration/schemas/upload-payload.shared";

export async function handleR2UploadPost(
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
