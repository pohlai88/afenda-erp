import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../surfaces/system-admin.list-surface.shared";

export const systemAdminBillingSurfaceKey = "system-admin.billing.list";

export function buildBillingPostureListSurface(input: {
  aiUsageEventCount: number;
  lynxRunCount: number;
  gatewaySpendAvailable: boolean;
  gatewaySpendAuthenticationFailed: boolean;
  gatewaySpendEntryCount: number;
  gatewayCostUsd: number;
  planState: string;
  seatCount: number;
  seatLimit: number | null;
  overagePosture: string;
  marketplaceLinkage: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const gatewayValue = input.gatewaySpendAuthenticationFailed
    ? "Gateway API key rejected - refresh AI_GATEWAY_API_KEY in Vercel AI Gateway"
    : input.gatewaySpendAvailable
      ? `$${input.gatewayCostUsd.toFixed(4)} (${input.gatewaySpendEntryCount} tag groups, MTD)`
      : "Unavailable - configure AI Gateway API key or use machine-layer ledger fallback";

  const rows = [
    {
      id: "plan-state",
      line: "Plan state",
      value: `${input.planState} - billing enforcement is not active`,
    },
    {
      id: "seats",
      line: "Seats observed",
      value:
        input.seatLimit === null
          ? `${input.seatCount} active tenant members (no enforced limit)`
          : `${input.seatCount}/${input.seatLimit}`,
    },
    {
      id: "machine-usage",
      line: "Machine usage events (tenant)",
      value: String(input.aiUsageEventCount),
    },
    {
      id: "lynx-runs",
      line: "Lynx runs (tenant)",
      value: String(input.lynxRunCount),
    },
    {
      id: "gateway-spend",
      line: "AI Gateway spend (MTD)",
      value: gatewayValue,
    },
    {
      id: "overage-posture",
      line: "Overage posture",
      value: input.overagePosture,
    },
    {
      id: "marketplace",
      line: "Vercel Marketplace",
      value: input.marketplaceLinkage,
    },
  ];

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "billing",
        searchPlaceholder: "Search billing posture",
        sortColumn: "line",
        sortOptions: [
          {
            label: "Line A-Z",
            value: "line-asc",
            columnId: "line",
            direction: "asc",
          },
          {
            label: "Line Z-A",
            value: "line-desc",
            columnId: "line",
            direction: "desc",
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "billing",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(rows.length),
    surface: {
      header: { title: "Billing posture" },
      columnsId: "system-admin-billing",
      rowKey: "id",
      empty: { variant: "muted", title: "No billing signals available." },
    },
    columns: [
      {
        id: "line",
        header: "Line",
        priority: "primary" as const,
        pin: "start" as const,
      },
      { id: "value", header: "Value" },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: { line: row.line, value: row.value },
    })),
  });
}
