import { and, count, eq, inArray, isNotNull, ne, or } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { listHrComplianceAlertsWindow } from "./hr-compliance-alerts";
import {
  deriveFilingEffectiveStatus,
  deriveRequirementEffectiveStatus,
} from "./hr-compliance-effective-status.shared";
import { listHrComplianceFilingsWindow } from "./hr-compliance-filings";
import {
  HR_COMPLIANCE_OVERVIEW_DIMENSIONS,
  type HrComplianceOverviewDimension,
} from "./hr-compliance-overview.shared";
import { listHrComplianceReviewQueueWindow } from "./hr-compliance-review-queue";
import { activeEmployeeFilters } from "./hr-compliance.internal";
import type {
  HrComplianceOverviewDimensionBreakdownRow,
  HrComplianceOverviewSnapshot,
} from "./hr-compliance.types";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceObligations,
  hrDepartments,
  hrEmployees,
} from "./hr";

function dimensionLabel(
  dimension: HrComplianceOverviewDimension,
  row: {
    departmentName: string | null;
    legalEntityCode: string | null;
    workLocationCode: string | null;
    workerCategory: string | null;
  },
): string {
  switch (dimension) {
    case "department":
      return row.departmentName?.trim() || "Unassigned";
    case "legal_entity":
      return row.legalEntityCode?.trim() || "Unscoped";
    case "work_location":
      return row.workLocationCode?.trim() || "Unscoped";
    case "worker_category":
      return row.workerCategory?.trim() || "Unscoped";
    default: {
      const exhaustive: never = dimension;
      return exhaustive;
    }
  }
}

/** HRM-CMP-022 — org-scoped compliance posture snapshot for governed overview surfaces. */
export async function loadHrComplianceOverviewSnapshot(input: {
  organizationId: string;
  canViewSensitive?: boolean;
}): Promise<HrComplianceOverviewSnapshot> {
  const canViewSensitive = input.canViewSensitive ?? false;
  const now = new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const activeEmployeeCondition = activeEmployeeFilters(input.organizationId);

    const [
      openExceptionCountRow,
      requirementRows,
      alertsWindow,
      reviewQueueWindow,
      filingsWindow,
    ] = await Promise.all([
      db
        .select({ total: count() })
        .from(hrComplianceExceptions)
        .where(
          and(
            eq(hrComplianceExceptions.organizationId, input.organizationId),
            inArray(hrComplianceExceptions.status, ["open", "in_progress"]),
          ),
        ),
      db
        .select({
          status: hrComplianceEmployeeRequirements.status,
          dueDate: hrComplianceEmployeeRequirements.dueDate,
          requirementKind: hrComplianceObligations.requirementKind,
          departmentName: hrDepartments.name,
          legalEntityCode: hrEmployees.legalEntityCode,
          workLocationCode: hrEmployees.workLocationCode,
          workerCategory: hrEmployees.workerCategory,
        })
        .from(hrComplianceEmployeeRequirements)
        .innerJoin(
          hrComplianceObligations,
          eq(
            hrComplianceEmployeeRequirements.obligationId,
            hrComplianceObligations.id,
          ),
        )
        .innerJoin(
          hrEmployees,
          eq(hrComplianceEmployeeRequirements.employeeId, hrEmployees.id),
        )
        .leftJoin(
          hrDepartments,
          eq(hrEmployees.currentDepartmentId, hrDepartments.id),
        )
        .where(
          and(
            eq(
              hrComplianceEmployeeRequirements.organizationId,
              input.organizationId,
            ),
            eq(hrComplianceObligations.status, "active"),
            activeEmployeeCondition,
            or(
              and(
                ne(hrComplianceEmployeeRequirements.status, "compliant"),
                ne(hrComplianceEmployeeRequirements.status, "waived"),
              ),
              and(
                eq(hrComplianceEmployeeRequirements.status, "compliant"),
                isNotNull(hrComplianceEmployeeRequirements.dueDate),
              ),
            ),
          ),
        ),
      listHrComplianceAlertsWindow({
        organizationId: input.organizationId,
        limit: 1000,
      }),
      listHrComplianceReviewQueueWindow({
        organizationId: input.organizationId,
        limit: 1,
        canViewSensitive,
      }),
      listHrComplianceFilingsWindow({
        organizationId: input.organizationId,
        limit: 1000,
      }),
    ]);

    let atRiskRequirementCount = 0;
    let overdueRequirementCount = 0;

    const dimensionMaps = Object.fromEntries(
      HR_COMPLIANCE_OVERVIEW_DIMENSIONS.map((dimension) => [
        dimension,
        new Map<
          string,
          {
            trackedCount: number;
            atRiskCount: number;
            overdueCount: number;
            openExceptionCount: number;
          }
        >(),
      ]),
    ) as Record<
      HrComplianceOverviewDimension,
      Map<
        string,
        {
          trackedCount: number;
          atRiskCount: number;
          overdueCount: number;
          openExceptionCount: number;
        }
      >
    >;

    for (const row of requirementRows) {
      const effectiveStatus = deriveRequirementEffectiveStatus({
        status: row.status,
        dueDate: row.dueDate,
        requirementKind: row.requirementKind,
        now,
      });

      if (effectiveStatus === "at_risk") {
        atRiskRequirementCount += 1;
      }
      if (effectiveStatus === "overdue") {
        overdueRequirementCount += 1;
      }

      for (const dimension of HR_COMPLIANCE_OVERVIEW_DIMENSIONS) {
        const label = dimensionLabel(dimension, row);
        const existing = dimensionMaps[dimension].get(label) ?? {
          trackedCount: 0,
          atRiskCount: 0,
          overdueCount: 0,
          openExceptionCount: 0,
        };

        dimensionMaps[dimension].set(label, {
          trackedCount: existing.trackedCount + 1,
          atRiskCount:
            existing.atRiskCount + (effectiveStatus === "at_risk" ? 1 : 0),
          overdueCount:
            existing.overdueCount + (effectiveStatus === "overdue" ? 1 : 0),
          openExceptionCount: existing.openExceptionCount,
        });
      }
    }

    const overdueFilingCount = filingsWindow.rows.filter(
      (row) =>
        deriveFilingEffectiveStatus({
          status: row.status,
          filingDeadline: row.filingDeadline,
          now,
        }) === "overdue",
    ).length;

    const criticalAlertCount = alertsWindow.rows.filter(
      (row) => row.severity === "critical",
    ).length;

    const dimensionBreakdown: HrComplianceOverviewDimensionBreakdownRow[] = [];

    for (const dimension of HR_COMPLIANCE_OVERVIEW_DIMENSIONS) {
      for (const [value, counts] of dimensionMaps[dimension].entries()) {
        dimensionBreakdown.push({
          id: `${dimension}:${value}`,
          dimension,
          dimensionValue: value,
          trackedCount: counts.trackedCount,
          atRiskCount: counts.atRiskCount,
          overdueCount: counts.overdueCount,
          openExceptionCount: counts.openExceptionCount,
        });
      }
    }

    dimensionBreakdown.sort((left, right) => {
      const dimensionOrder =
        HR_COMPLIANCE_OVERVIEW_DIMENSIONS.indexOf(left.dimension) -
        HR_COMPLIANCE_OVERVIEW_DIMENSIONS.indexOf(right.dimension);
      if (dimensionOrder !== 0) {
        return dimensionOrder;
      }
      return (
        right.overdueCount - left.overdueCount ||
        right.atRiskCount - left.atRiskCount ||
        left.dimensionValue.localeCompare(right.dimensionValue)
      );
    });

    return {
      openExceptionCount: Number(openExceptionCountRow[0]?.total ?? 0),
      criticalAlertCount,
      overdueFilingCount,
      pendingReviewCount: reviewQueueWindow.totalCount,
      atRiskRequirementCount,
      overdueRequirementCount,
      dimensionBreakdown,
    };
  });
}

export {
  HR_COMPLIANCE_OVERVIEW_DIMENSIONS,
  HR_COMPLIANCE_REPORT_EXPORT_ROW_CAP,
  HR_COMPLIANCE_REPORT_KINDS,
  type HrComplianceOverviewDimension,
  type HrComplianceReportKind,
} from "./hr-compliance-overview.shared";
