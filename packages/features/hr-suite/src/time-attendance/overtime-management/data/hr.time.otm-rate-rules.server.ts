import {
  listHrOvertimeRateRules,
  type HrOvertimeRateRuleRow,
} from "@afenda/db";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import { hrOtmRateRulesColumnsId } from "../surface/hr.time.otm-surface-metadata.shared";
import { hrTimeOtmReadPermission } from "../contracts/hr.time.otm-route.contract";

/** HRM-OTM-007 — Pattern C admin list for configured rate rules (AC 6). */
export async function buildHrTimeOtmRateRulesListSurface(input: {
  organizationId: string;
  policyGroupCode?: string;
  surfaceKey: string;
}): Promise<ListSurfaceRendererConfigurationResolvedInput> {
  const rules = await listHrOvertimeRateRules({
    organizationId: input.organizationId,
    policyGroupCode: input.policyGroupCode,
  });

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeOtmReadPermission,
    presentation: {
      primaryColumnId: "name",
    },
    pagination: {
      pageSize: rules.length,
      totalCount: rules.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Overtime rate rules" },
      columnsId: hrOtmRateRulesColumnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No rate rules",
        description:
          "Configure pay multipliers by overtime type, day type, shift, employee group, and country.",
      },
    },
    columns: [
      { id: "name", header: "Rule", priority: "primary", pin: "start" },
      { id: "multiplier", header: "Multiplier" },
      { id: "type", header: "OT type" },
      { id: "day", header: "Day type" },
      { id: "shift", header: "Shift" },
      { id: "group", header: "Employee group" },
      { id: "country", header: "Country" },
      { id: "earning", header: "Earning code" },
    ],
    rows: rules.map((rule) => ({
      id: rule.id,
      cells: formatRateRuleCells(rule),
    })),
  });
}

function formatRateRuleCells(rule: HrOvertimeRateRuleRow): Record<string, string> {
  return {
    name: rule.name,
    multiplier: `${rule.multiplier}x`,
    type: rule.overtimeType ?? "Any",
    day: rule.dayCategory ?? "Any",
    shift: rule.shiftCategory ?? "Any",
    group: rule.employeeCategory ?? "Any",
    country: rule.countryCode ?? "Any",
    earning: rule.earningCode,
  };
}
