import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../surfaces/system-admin.list-surface.shared";

export const systemAdminGatewaySpendSurfaceKey =
  "system-admin.gateway-spend.list";

const SPEND_COLUMNS = [
  {
    id: "model",
    header: "Model",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "feature", header: "Feature" },
  { id: "totalCost", header: "Cost" },
  { id: "totalTokens", header: "Tokens" },
];

export function buildGatewaySpendListSurface(input: {
  available: boolean;
  authenticationFailed?: boolean;
  entries: ReadonlyArray<{
    model: string;
    feature: string;
    totalCost: string;
    totalTokens: string;
  }>;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "gatewaySpend",
        searchPlaceholder: "Search gateway spend",
        sortColumn: "totalCost",
        sortOptions: [
          {
            label: "Cost high-low",
            value: "cost-desc",
            columnId: "totalCost",
            direction: "desc",
          },
          {
            label: "Model A-Z",
            value: "model-asc",
            columnId: "model",
            direction: "asc",
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "gateway-spend",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.entries.length),
    surface: {
      header: { title: "AI Gateway spend" },
      columnsId: "system-admin-gateway-spend",
      rowKey: "model",
      empty: {
        variant: "muted",
        title: input.available
          ? "No gateway spend entries for this period."
          : input.authenticationFailed
            ? "Gateway API key was rejected. Update AI_GATEWAY_API_KEY from the Vercel AI Gateway console."
            : "Gateway billing credentials are not configured for this environment.",
      },
    },
    columns: SPEND_COLUMNS,
    rows: input.entries.map((entry, index) => ({
      id: `${entry.model}:${entry.feature}:${index}`,
      cells: {
        model: entry.model,
        feature: featureLabel(entry.feature),
        totalCost: entry.totalCost,
        totalTokens: entry.totalTokens,
      },
    })),
  });
}

function featureLabel(feature: string) {
  return feature.replace(/-/g, " ");
}
