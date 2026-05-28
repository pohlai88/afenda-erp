import { getGatewaySpendReport } from "@afenda/ai/server";
import { listLynxEvalRuns } from "@afenda/feature-knowledge/server";
import { listAiUsageEvents, listTenantMembers } from "../data";

export async function getBillingPostureSnapshot(input: {
  organizationId: string;
}) {
  const [aiUsageEvents, lynxEvalRuns, gatewaySpend, members] =
    await Promise.all([
      listAiUsageEvents({ organizationId: input.organizationId, limit: 500 }),
      listLynxEvalRuns(input.organizationId, 500),
      getGatewaySpendReport({ organizationId: input.organizationId }),
      listTenantMembers({ organizationId: input.organizationId, limit: 200 }),
    ]);

  const gatewayCostUsd = gatewaySpend.entries.reduce(
    (sum, entry) => sum + entry.costUsd,
    0,
  );

  return {
    aiUsageEventCount: aiUsageEvents.length,
    lynxRunCount: lynxEvalRuns.length,
    gatewaySpendAvailable: gatewaySpend.available,
    gatewaySpendAuthenticationFailed:
      gatewaySpend.authenticationFailed ?? false,
    gatewaySpendEntryCount: gatewaySpend.entries.length,
    gatewayCostUsd,
    planState: "staged",
    seatCount: members.length,
    seatLimit: null,
    overagePosture: "not enforced",
    marketplaceLinkage: "managed in Vercel",
  };
}
