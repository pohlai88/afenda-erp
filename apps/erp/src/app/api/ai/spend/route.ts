import {
  assertCapabilityAllowed,
  getGatewaySpendReport,
  hasAiGatewayCredentials,
  isAiPermissionError,
} from "@afenda/ai";
import { getApiAuthContext } from "@afenda/auth/server";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { NextResponse } from "next/server";
import { withAiSpan } from "@/lib/ai-tracing";

export async function GET(request: Request): Promise<NextResponse> {
  const requestId = getRequestId(request);
  const route = "/api/ai/spend";

  if (!hasAiGatewayCredentials()) {
    return NextResponse.json({ available: false, entries: [] }, { status: 200 });
  }

  try {
    const auth = await getApiAuthContext();

    if (auth instanceof NextResponse) {
      return auth;
    }

    const { organization } = auth;

    assertCapabilityAllowed({
      capability: "system-admin.billing.read",
      capabilities: organization.capabilities,
    });

    const report = await withAiSpan(
      "ai.spend.report",
      {
        feature: "erp-assistant",
        model: "gateway-metrics",
        organizationId: organization.id,
        requestId,
      },
      () => getGatewaySpendReport({ organizationId: organization.id }),
    );

    return NextResponse.json(report, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    logServerEvent(
      "error",
      "AI Gateway spend report failed.",
      {
        requestId,
        module: "system-admin",
        operation: "ai.spend.report",
      },
      {
        route,
        error: error instanceof Error ? error.message : String(error),
      },
    );

    return NextResponse.json(
      {
        error: isAiPermissionError(error)
          ? "Insufficient permissions for AI spend reporting."
          : "AI Gateway spend report failed.",
      },
      { status: isAiPermissionError(error) ? 403 : 500 },
    );
  }
}
