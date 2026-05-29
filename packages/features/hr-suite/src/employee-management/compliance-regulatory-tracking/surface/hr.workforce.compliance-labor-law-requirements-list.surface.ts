import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrEmployeeLaborLawRequirementWindow } from "@afenda/db";

import { hrWorkforceComplianceReadPermission } from "../contracts/hr.workforce.compliance.contract";
import {
  deriveEffectiveLaborLawRequirementStatus,
} from "../data/hr.workforce.compliance-status.shared";
import {
  buildComplianceListSearchToolbar,
  formatComplianceListEnumCell,
  resolveLaborLawRequirementListBadgeTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceLaborLawRequirementsSurfaceKey =
  "hr.workforce.compliance.labor-law-requirements.list";

export const hrComplianceLaborLawSearchParam = "complianceLaborLawSearch";

export function buildHrComplianceLaborLawRequirementsListSurface(input: {
  window: HrEmployeeLaborLawRequirementWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.laborLaw;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrWorkforceComplianceReadPermission,
    presentation: {
      primaryColumnId: "requirement",
      toolbar: buildComplianceListSearchToolbar({
        param: hrComplianceLaborLawSearchParam,
        label: copy.searchLabel,
        placeholder: copy.searchPlaceholder,
        value: searchValue,
      }),
    },
    pagination: {
      pageSize: window.pageSize,
      totalCount: window.totalCount,
      hasNextPage: window.hasNextPage,
    },
    surface: {
      header: { title: copy.surfaceHeaderTitle },
      columnsId: "hr.workforce.compliance.labor-law-requirements",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: copy.emptyDescription,
      },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        minWidth: 160,
        cellKind: { kind: "link" },
      },
      {
        id: "requirement",
        header: copy.colRequirement,
        priority: "primary",
        wrap: true,
        minWidth: 220,
      },
      {
        id: "area",
        header: copy.colArea,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "dueDate", header: copy.colDue, cellKind: { kind: "date" } },
      { id: "completedAt", header: copy.colCompleted, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => {
      const effectiveStatus = deriveEffectiveLaborLawRequirementStatus({
        status: row.status,
        dueDate: row.dueDate,
      });

      return {
        id: row.id,
        rowHref: `/hr/employees/${row.employeeId}`,
        linkColumnId: "employee",
        rowTone: resolveLaborLawRequirementListBadgeTone(effectiveStatus),
        cells: {
          employee: `${row.employeeNumber} · ${row.employeeDisplayName}`,
          requirement: `${row.obligationCode} · ${row.obligationTitle}`,
          area: formatComplianceListEnumCell(row.complianceArea),
          status: formatComplianceListEnumCell(effectiveStatus),
          dueDate: row.dueDate?.toISOString() ?? "",
          completedAt: row.completedAt?.toISOString() ?? "",
        },
        cellKinds: {
          status: {
            kind: "badge",
            tone: resolveLaborLawRequirementListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: canWrite
          ? resolveListSurfaceRowTrailingAction({
              visible: effectiveStatus !== "compliant",
              allowed: true,
            })
          : undefined,
      };
    }),
  });
}
