import { getApiAuthContext } from "@afenda/kernel/server";
import { getRequestId, logServerEvent } from "@afenda/observability/server";
import { NextResponse } from "next/server";

import { AI_ERP_HTTP_ROUTES } from "./ai-http.contract";
import { withAiSpan } from "./ai-tracing.repository.server";
import {
  getGatewaySpendReport,
  hasAiGatewayRuntimeCredentials,
} from "./ai-gateway.repository.server";
import {
  assertCapabilityAllowed,
  isAiPermissionError,
} from "./ai-guardrails.policy";

export async function handleAiGatewaySpendGet(
  request: Request,
): Promise<Response> {
  const requestId = getRequestId(request) ?? "";
  const route = AI_ERP_HTTP_ROUTES.gatewaySpend;

  if (!hasAiGatewayRuntimeCredentials()) {
    return NextResponse.json(
      { available: false, entries: [] },
      { status: 200 },
    );
  }

  try {
    const auth = await getApiAuthContext();
    if (auth instanceof Response) return auth;

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
      headers: { "Cache-Control": "private, max-age=300" },
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
