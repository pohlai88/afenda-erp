import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrIndustryGpgListRow } from "../contracts/hr.industry.gpg.contract";
import { buildHrIndustryGpgListSurface } from "../surface/hr.industry.gpg-lists.surface";
import { buildHrIndustryGpgOverviewStatGrid } from "../surface/hr.industry.gpg-overview-stat.surface";
import {
  hrIndustryGpgAuditTrailSurfaceKey,
  hrIndustryGpgClassificationAssignmentsSurfaceKey,
  hrIndustryGpgClassificationReviewsSurfaceKey,
  hrIndustryGpgClassificationsSurfaceKey,
  hrIndustryGpgGradeMovementsSurfaceKey,
  hrIndustryGpgIntegrationExposuresSurfaceKey,
  hrIndustryGpgLocalityAdjustmentsSurfaceKey,
  hrIndustryGpgPayGradesSurfaceKey,
  hrIndustryGpgReportsSurfaceKey,
  hrIndustryGpgSalaryTablesSurfaceKey,
  hrIndustryGpgStepEligibilityRulesSurfaceKey,
  hrIndustryGpgStepIncreaseCandidatesSurfaceKey,
  type HrIndustryGpgListSurfaceKey,
} from "../surface/hr.industry.gpg-surface-metadata.shared";
import { hrIndustryGpgUiCopy } from "../surface/hr.industry.gpg-ui.copy.shared";
import type { HrIndustryGpgPageModelInput } from "./hr.industry.gpg-search-params.parse.shared";
import {
  buildHrIndustryGpgReportRows,
  filterHrIndustryGpgRecordsForAccess,
  getHrIndustryGpgStore,
  type HrIndustryGpgStore,
} from "./hr.industry.gpg-store.shared";

const GPG_DEFAULT_PAGE_SIZE = 25;

export type HrIndustryGpgPageModelListSection = {
  readonly surfaceKey: HrIndustryGpgListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrIndustryGpgPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrIndustryGpgPageModelInput["reportGroupBy"];
  readonly status: HrIndustryGpgPageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrIndustryGpgPageModelListSection[];
  readonly workbenchList: ListSurfaceRendererConfigurationResolvedInput;
};

type SearchableRecord = { readonly id: string };

function formatEnumLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "Not recorded";
}

function formatMoney(value: number | null | undefined) {
  if (value == null) return "Not recorded";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, GPG_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, GPG_DEFAULT_PAGE_SIZE);
}

function rowMatchesStatus(
  row: {
    readonly status?: unknown;
    readonly validationStatus?: unknown;
    readonly eligibilityStatus?: unknown;
  },
  status: HrIndustryGpgPageModelInput["status"],
) {
  if (status === "all") return true;
  return (
    row.status === status ||
    row.validationStatus === status ||
    row.eligibilityStatus === status
  );
}

function toneForStatus(value: string): HrIndustryGpgListRow["rowTone"] {
  if (
    [
      "blocked",
      "rejected",
      "retired",
      "superseded",
      "downgrade",
      "demotion",
    ].includes(value)
  ) {
    return "critical";
  }
  if (
    [
      "draft",
      "under_review",
      "warning",
      "requires_review",
      "pending_approval",
      "submitted",
      "not_yet_eligible",
    ].includes(value)
  ) {
    return "attention";
  }
  return undefined;
}

function section(input: {
  readonly surfaceKey: HrIndustryGpgListSurfaceKey;
  readonly rows: readonly HrIndustryGpgListRow[];
  readonly searchValue?: string;
}): HrIndustryGpgPageModelListSection {
  const copy = hrIndustryGpgUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrIndustryGpgListSurface(input),
  };
}

function redactPay(value: number, canReadRestricted: boolean) {
  return canReadRestricted ? formatMoney(value) : "Restricted";
}

function buildClassificationRows(
  store: HrIndustryGpgStore,
  input: HrIndustryGpgPageModelInput,
): HrIndustryGpgListRow[] {
  return store.classifications
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        classificationCode: row.classificationCode,
        classificationName: row.classificationName,
        jobSeries: row.jobSeries,
        serviceScheme: row.serviceScheme,
        agencyName: row.agency,
        departmentName: row.department,
        reference: `${formatEnumLabel(row.referenceType)} ${row.referenceCode}`,
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildAssignmentRows(
  store: HrIndustryGpgStore,
  input: HrIndustryGpgPageModelInput,
): HrIndustryGpgListRow[] {
  return store.positionAssignments
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.validationStatus),
      cells: {
        employeeDisplayName: row.employeeDisplayName,
        positionTitle: row.positionTitle,
        classificationCode: row.classificationCode,
        gradeStep: `${row.gradeCode} Step ${row.stepCode.replace(/^S0?/, "")}`,
        agencyName: row.agency,
        departmentName: row.department,
        effectiveDate: formatDate(row.effectiveFrom),
        status: formatEnumLabel(row.validationStatus),
      },
    }));
}

export async function buildHrIndustryGpgPageModel(
  input: HrIndustryGpgPageModelInput,
): Promise<HrIndustryGpgPageModel> {
  const store = getHrIndustryGpgStore(input.organizationId);
  const visibleStore = filterHrIndustryGpgRecordsForAccess({
    store,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });
  const assignmentRows = buildAssignmentRows(visibleStore, input);
  const reportRows = buildHrIndustryGpgReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });
  const overview = buildHrIndustryGpgOverviewStatGrid({
    snapshot: {
      activeClassificationCount: visibleStore.classifications.filter(
        (row) => row.status === "active",
      ).length,
      publishedSalaryTableCount: visibleStore.salaryTableVersions.filter(
        (row) => row.status === "published",
      ).length,
      validAssignmentCount: visibleStore.positionAssignments.filter(
        (row) => row.validationStatus === "valid",
      ).length,
      blockedAssignmentCount: visibleStore.positionAssignments.filter(
        (row) => row.validationStatus === "blocked",
      ).length,
      eligibleStepCandidateCount: visibleStore.stepIncreaseCandidates.filter(
        (row) => row.eligibilityStatus === "eligible",
      ).length,
      pendingMovementCount: visibleStore.gradeMovements.filter(
        (row) => row.status === "pending_approval",
      ).length,
    },
  });

  const sections: HrIndustryGpgPageModelListSection[] = [
    section({
      surfaceKey: hrIndustryGpgClassificationsSurfaceKey,
      searchValue: input.classificationsSearch,
      rows: filterRows(
        buildClassificationRows(visibleStore, input),
        input.classificationsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryGpgPayGradesSurfaceKey,
      searchValue: input.payGradesSearch,
      rows: filterRows(
        visibleStore.payGrades.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.payGradesSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          gradeCode: row.gradeCode,
          gradeName: row.gradeName,
          payBandCode: row.payBandCode,
          rankReference: row.rankReference ?? "Not assigned",
          salaryRange: `${redactPay(row.minSalary, input.canReadRestricted)} - ${redactPay(
            row.maxSalary,
            input.canReadRestricted,
          )}`,
          stepCount: row.stepCount,
          effectiveDate: formatDate(row.effectiveFrom),
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryGpgSalaryTablesSurfaceKey,
      searchValue: input.salaryTablesSearch,
      rows: filterRows(
        visibleStore.salaryTableVersions.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.salaryTablesSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          salaryTableCode: row.salaryTableCode,
          version: row.version,
          gradeCode: row.gradeCode,
          stepCode: row.stepCode,
          baseRate: redactPay(row.baseRate, input.canReadRestricted),
          salaryRange: `${redactPay(row.minSalary, input.canReadRestricted)} - ${redactPay(
            row.maxSalary,
            input.canReadRestricted,
          )}`,
          effectiveDate: formatDate(row.effectiveFrom),
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryGpgLocalityAdjustmentsSurfaceKey,
      searchValue: input.localityAdjustmentsSearch,
      rows: filterRows(
        visibleStore.localityAdjustmentRules.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.localityAdjustmentsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          localityArea: row.localityArea,
          region: row.region,
          country: row.country,
          city: row.city,
          dutyStation: row.dutyStation,
          adjustmentType: formatEnumLabel(row.adjustmentType),
          adjustmentRate: `${row.adjustmentRate}%`,
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryGpgClassificationAssignmentsSurfaceKey,
      searchValue: input.classificationAssignmentsSearch,
      rows: filterRows(assignmentRows, input.classificationAssignmentsSearch),
    }),
    section({
      surfaceKey: hrIndustryGpgStepEligibilityRulesSurfaceKey,
      searchValue: input.stepEligibilityRulesSearch,
      rows: filterRows(
        visibleStore.stepEligibilityRules.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.stepEligibilityRulesSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          gradeStep: `${row.gradeCode} ${row.stepCode}`,
          nextStepCode: row.nextStepCode,
          appointmentType: formatEnumLabel(row.appointmentType),
          waitingPeriod: `${row.waitingPeriodMonths} months`,
          performanceReference: formatEnumLabel(row.performanceReference),
          processingMode: formatEnumLabel(row.processingMode),
          effectiveDate: formatDate(row.effectiveFrom),
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryGpgStepIncreaseCandidatesSurfaceKey,
      searchValue: input.stepIncreaseCandidatesSearch,
      rows: filterRows(
        visibleStore.stepIncreaseCandidates.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.stepIncreaseCandidatesSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.eligibilityStatus),
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          gradeCode: row.gradeCode,
          currentStepCode: row.currentStepCode,
          nextStepCode: row.nextStepCode,
          serviceMonths: `${row.serviceMonths} months`,
          eligibilityDate: formatDate(row.eligibilityDate),
          processingMode: formatEnumLabel(row.processingMode),
          status: formatEnumLabel(row.eligibilityStatus),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryGpgGradeMovementsSurfaceKey,
      searchValue: input.gradeMovementsSearch,
      rows: filterRows(
        visibleStore.gradeMovements.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.gradeMovementsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status) ?? toneForStatus(row.movementType),
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          movementType: formatEnumLabel(row.movementType),
          fromGradeStep: `${row.fromGradeCode} ${row.fromStepCode}`,
          toGradeStep: `${row.toGradeCode} ${row.toStepCode}`,
          effectiveDate: formatDate(row.effectiveDate),
          reason: input.canReadRestricted ? row.reason : "Restricted",
          reference: row.retentionRef ?? row.lifecycleRef ?? "Pending",
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryGpgClassificationReviewsSurfaceKey,
      searchValue: input.classificationReviewsSearch,
      rows: filterRows(
        visibleStore.classificationReviews.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.classificationReviewsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          classificationCode: row.classificationCode,
          positionId: row.positionId,
          reviewType: formatEnumLabel(row.reviewType),
          requestedBy: row.requestedBy,
          effectiveDate: formatDate(row.effectiveDate),
          outcomeRef: row.outcomeRef ?? "Pending",
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryGpgReportsSurfaceKey,
      searchValue: input.reportsSearch,
      rows: filterRows(reportRows, input.reportsSearch).map((row) => ({
        id: row.id,
        rowTone:
          row.blockedAssignmentCount > 0
            ? "critical"
            : row.pendingMovementCount + row.eligibleStepCandidateCount > 0
              ? "attention"
              : undefined,
        cells: {
          groupLabel: row.groupLabel,
          assignmentCount: row.assignmentCount,
          publishedSalaryTableCount: row.publishedSalaryTableCount,
          eligibleStepCandidateCount: row.eligibleStepCandidateCount,
          pendingMovementCount: row.pendingMovementCount,
          blockedAssignmentCount: row.blockedAssignmentCount,
          averageLocalityAdjustedPay: redactPay(
            row.averageLocalityAdjustedPay,
            input.canReadRestricted,
          ),
        },
      })),
    }),
  ];

  if (input.canExposeIntegrations) {
    sections.push(
      section({
        surfaceKey: hrIndustryGpgIntegrationExposuresSurfaceKey,
        searchValue: input.integrationExposuresSearch,
        rows: filterRows(
          visibleStore.integrationExposures,
          input.integrationExposuresSearch,
        ).map((row) => ({
          id: row.id,
          rowTone: toneForStatus(row.status),
          cells: {
            integrationTarget: formatEnumLabel(row.integrationTarget),
            sourceRef: row.sourceRef,
            approvedReference: row.approvedReference,
            status: formatEnumLabel(row.status),
            exposedAt: formatDate(row.exposedAt),
          },
        })),
      }),
    );
  }

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: hrIndustryGpgAuditTrailSurfaceKey,
        searchValue: input.auditTrailSearch,
        rows: filterRows(visibleStore.auditEvents, input.auditTrailSearch).map(
          (event) => ({
            id: event.id,
            cells: {
              summary: event.summary,
              action: event.action,
              actorId: event.actorId,
              targetType: formatEnumLabel(event.targetType),
              employeeId: event.employeeId ?? "System",
              occurredAt: formatDate(event.occurredAt),
            },
          }),
        ),
      }),
    );
  }

  return {
    title: hrIndustryGpgUiCopy.page.title,
    description: hrIndustryGpgUiCopy.page.description,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canExposeIntegrations: input.canExposeIntegrations,
    reportGroupBy: input.reportGroupBy,
    status: input.status,
    overview,
    sections,
    workbenchList:
      sections.find(
        (candidate) =>
          candidate.surfaceKey ===
          hrIndustryGpgClassificationAssignmentsSurfaceKey,
      )?.listConfiguration ??
      buildHrIndustryGpgListSurface({
        surfaceKey: hrIndustryGpgClassificationAssignmentsSurfaceKey,
        rows: [],
      }),
  };
}
