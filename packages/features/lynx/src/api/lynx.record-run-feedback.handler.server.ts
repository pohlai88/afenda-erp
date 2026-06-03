import { isAiPermissionError } from "@afenda/ai/server";
import { getApiAuthContext } from "../server";
import { getRequestId, logServerEvent } from "@afenda/observability/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { executeLynxRecordRunFeedbackCommand } from "../commands/lynx.record-run-feedback.command.server";
import {
  LYNX_AUDIT_ACTIONS,
  LYNX_ERP_HTTP_ROUTES,
  LYNX_MODULE_ID,
  LYNX_WORKSPACE_ROUTES,
} from "../contracts/lynx.core.contract";
import { lynxLiveRunFeedbackRequestSchema } from "../schemas/lynx.run-feedback.schema";

export async function handleLynxRecordRunFeedbackPost(
  request: Request,
): Promise<Response> {
  const requestId = getRequestId(request) ?? "";
  const route = LYNX_ERP_HTTP_ROUTES.runFeedback;

  try {
    const auth = await getApiAuthContext();
    if (auth instanceof Response) return auth;

    const { session, organization } = auth;
    const body = await request.json().catch(() => ({}));
    const parsed = lynxLiveRunFeedbackRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await executeLynxRecordRunFeedbackCommand({
      organizationId: organization.id,
      userAuthId: session.id,
      capabilities: organization.capabilities,
      request: parsed.data,
      requestId,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Lynx run was not found." },
        { status: 404 },
      );
    }

    revalidatePath(LYNX_WORKSPACE_ROUTES.runDetail(parsed.data.runId));
    revalidatePath(LYNX_WORKSPACE_ROUTES.runs);

    logServerEvent(
      "info",
      "Lynx run feedback recorded.",
      {
        requestId,
        organizationId: organization.id,
        userId: session.id,
        module: LYNX_MODULE_ID,
        operation: LYNX_AUDIT_ACTIONS.runFeedback,
      },
      {
        route,
        runId: parsed.data.runId,
        rating: parsed.data.rating,
        category: parsed.data.category,
      },
    );

    return NextResponse.json({ feedbackId: result.feedbackId, ok: true });
  } catch (error) {
    logServerEvent(
      "error",
      "Lynx run feedback failed.",
      {
        requestId,
        module: LYNX_MODULE_ID,
        operation: LYNX_AUDIT_ACTIONS.runFeedback,
      },
      {
        route,
        error: error instanceof Error ? error.message : String(error),
      },
    );

    return NextResponse.json(
      {
        error: isAiPermissionError(error)
          ? "Insufficient permissions for Lynx feedback."
          : "Could not save Lynx feedback.",
      },
      { status: isAiPermissionError(error) ? 403 : 500 },
    );
  }
}
