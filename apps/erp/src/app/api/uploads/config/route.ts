import { moduleIds } from "@afenda/config/module-ids";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assertBlobConfigured,
  buildTenantBlobPathPrefix,
} from "@/lib/api/blob-upload";
import { requireBlobModuleAccess } from "@/lib/api/blob-route-auth";
import {
  getBlobRouteErrorResponse,
  UploadRouteError,
} from "@/lib/api/upload-route";

const moduleIdSchema = z.enum(moduleIds);

export async function GET(request: Request): Promise<NextResponse> {
  try {
    assertBlobConfigured();
  } catch (error) {
    const response = getBlobRouteErrorResponse(error);
    return NextResponse.json(
      {
        configured: false,
        error: response.message,
      },
      { status: response.status },
    );
  }

  try {
    const url = new URL(request.url);
    const moduleId = moduleIdSchema.parse(url.searchParams.get("moduleId"));
    const { organization } = await requireBlobModuleAccess(moduleId, "upload");

    return NextResponse.json({
      configured: true,
      pathnamePrefix: buildTenantBlobPathPrefix({
        organizationId: organization.id,
        moduleId,
      }),
    });
  } catch (error) {
    const response = getBlobRouteErrorResponse(error);

    return NextResponse.json(
      {
        configured: true,
        authorized: !(error instanceof UploadRouteError),
        error: response.message,
      },
      { status: response.status },
    );
  }
}
