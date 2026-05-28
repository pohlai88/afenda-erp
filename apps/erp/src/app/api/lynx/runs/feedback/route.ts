import {
  assertCapabilityAllowed,
  isAiPermissionError,
} from "@afenda/ai/server";
import { getApiAuthContext } from "@afenda/auth/server";
import { getLynxRunDetail, recordLynxRunFeedback } from "@afenda/db";
import {
  LYNX_AUDIT_ACTIONS,
  LYNX_ERP_HTTP_ROUTES,
  LYNX_MODULE_ID,
  lynxLiveRunFeedbackRequestSchema,
} from "@afenda/feature-lynx";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  const route = LYNX_ERP_HTTP_ROUTES.runFeedback;

  try {
    const auth = await getApiAuthContext();
    if (auth instanceof NextResponse) return auth;

    const { session, organization } = auth;
    assertCapabilityAllowed({
      capability: "system-admin.machine-layer.read",
      capabilities: organization.capabilities,
    });

    const body = await request.json().catch(() => ({}));
    const parsed = lynxLiveRunFeedbackRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const run = await getLynxRunDetail({
      organizationId: organization.id,
      runId: parsed.data.runId,
    });

    if (!run) {
      return NextResponse.json(
        { error: "Lynx run was not found." },
        { status: 404 },
      );
    }

    const feedbackId = await recordLynxRunFeedback({
      organizationId: organization.id,
      runId: parsed.data.runId,
      userAuthId: session.id,
      rating: parsed.data.rating,
      category: parsed.data.category,
      note: parsed.data.note ?? "",
      metadata: {
        route: "lynx.live-message",
        runRoute: run.route,
        requestId,
        ...(parsed.data.messageId ? { messageId: parsed.data.messageId } : {}),
        ...(run.workflowId ? { workflowId: run.workflowId } : {}),
        ...(run.workflowSessionId
          ? { workflowSessionId: run.workflowSessionId }
          : {}),
      },
    });

    revalidatePath(`/solution-console/runs/${parsed.data.runId}`);
    revalidatePath("/solution-console/runs");

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

    return NextResponse.json({ feedbackId, ok: true });
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
