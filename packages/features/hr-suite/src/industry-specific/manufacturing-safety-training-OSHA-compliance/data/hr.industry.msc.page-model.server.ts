import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrIndustryMscListRow } from "../contracts/hr.industry.msc.contract";
import type { HrMscStatusFilter } from "../schemas/hr.industry.msc-constants.shared";
import type {
  HrMscCorrectiveActionInput,
  HrMscHazardAssessmentInput,
  HrMscSafetyEligibilityRecordInput,
  HrMscWorkplaceIncidentInput,
  HrMscWorkRestrictionInput,
} from "../schemas/hr.industry.msc.schema";
import { buildHrIndustryMscListSurface } from "../surface/hr.industry.msc-lists.surface";
import { buildHrIndustryMscOverviewStatGrid } from "../surface/hr.industry.msc-overview-stat.surface";
import {
  hrIndustryMscAuditTrailSurfaceKey,
  hrIndustryMscCertificationsSurfaceKey,
  hrIndustryMscCorrectiveActionsSurfaceKey,
  hrIndustryMscEmployeeObligationsSurfaceKey,
  hrIndustryMscEvidenceLinksSurfaceKey,
  hrIndustryMscHazardAssessmentsSurfaceKey,
  hrIndustryMscIncidentsSurfaceKey,
  hrIndustryMscIntegrationExposuresSurfaceKey,
  hrIndustryMscNotificationsSurfaceKey,
  hrIndustryMscReportsSurfaceKey,
  hrIndustryMscRequirementsSurfaceKey,
  hrIndustryMscTrainingAssignmentsSurfaceKey,
  hrIndustryMscWorkRestrictionsSurfaceKey,
  type HrIndustryMscListSurfaceKey,
} from "../surface/hr.industry.msc-surface-metadata.shared";
import { hrIndustryMscUiCopy } from "../surface/hr.industry.msc-ui.copy.shared";
import type { HrIndustryMscPageModelInput } from "./hr.industry.msc-search-params.parse.shared";
import {
  buildHrIndustryMscReportRows,
  filterHrIndustryMscRecordsForAccess,
  getHrIndustryMscStore,
  listHrIndustryMscSafetyEligibilityRecords,
  type HrIndustryMscStore,
} from "./hr.industry.msc-store.shared";

const MSC_DEFAULT_PAGE_SIZE = 25;

export type HrIndustryMscPageModelListSection = {
  readonly surfaceKey: HrIndustryMscListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrIndustryMscPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrIndustryMscPageModelInput["reportGroupBy"];
  readonly status: HrIndustryMscPageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrIndustryMscPageModelListSection[];
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

function formatList(values: readonly string[] | null | undefined) {
  if (!values || values.length === 0) return "None";
  return values.map(formatEnumLabel).join(", ");
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, MSC_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, MSC_DEFAULT_PAGE_SIZE);
}

function rowMatchesStatus(
  row: {
    readonly status?: unknown;
    readonly eligibilityStatus?: unknown;
    readonly riskLevel?: unknown;
    readonly riskCategory?: unknown;
  },
  status: HrMscStatusFilter,
) {
  if (status === "all") return true;
  return (
    row.status === status ||
    row.eligibilityStatus === status ||
    row.riskLevel === status ||
    row.riskCategory === status
  );
}

function toneForStatus(value: string): HrIndustryMscListRow["rowTone"] {
  if (
    [
      "critical",
      "high",
      "overdue",
      "expired",
      "failed",
      "restricted",
      "active_restriction",
      "reported",
      "under_review",
      "corrective_action_pending",
      "recordable_reference",
    ].includes(value)
  ) {
    return "critical";
  }
  if (
    [
      "assigned",
      "expiring",
      "renewal_due",
      "pending_review",
      "draft",
      "in_progress",
      "reviewed",
      "medium",
    ].includes(value)
  ) {
    return "attention";
  }
  return undefined;
}

function section(input: {
  readonly surfaceKey: HrIndustryMscListSurfaceKey;
  readonly rows: readonly HrIndustryMscListRow[];
  readonly searchValue?: string;
}): HrIndustryMscPageModelListSection {
  const copy = hrIndustryMscUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrIndustryMscListSurface(input),
  };
}

function redact(value: string | undefined, canReadRestricted: boolean) {
  if (!value) return "Not recorded";
  return canReadRestricted ? value : "Restricted";
}

function buildRequirementRows(
  store: HrIndustryMscStore,
  input: HrIndustryMscPageModelInput,
): HrIndustryMscListRow[] {
  return store.safetyTrainingRequirements
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.riskCategory) ?? toneForStatus(row.status),
      cells: {
        requirement: `${formatEnumLabel(row.trainingType)} for ${row.roleName}`,
        site: `${row.siteName} (${row.country})`,
        departmentRole: `${row.departmentName} / ${row.roleName}`,
        machineWorkArea: row.machineName
          ? `${row.machineName} / ${row.workArea}`
          : row.workArea,
        trainingType: formatEnumLabel(row.trainingType),
        riskCategory: formatEnumLabel(row.riskCategory),
        complianceReference: `${formatEnumLabel(row.complianceReferenceType)} ${row.complianceReference}`,
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildEligibilityRows(input: {
  readonly store: HrIndustryMscStore;
  readonly eligibilityRows: readonly HrMscSafetyEligibilityRecordInput[];
  readonly pageInput: HrIndustryMscPageModelInput;
}): HrIndustryMscListRow[] {
  const profilesByEmployee = new Map(
    input.store.employeeSafetyProfiles.map((profile) => [
      profile.employeeId,
      profile,
    ]),
  );

  return input.eligibilityRows
    .filter((row) => rowMatchesStatus(row, input.pageInput.status))
    .map((row) => {
      const profile = profilesByEmployee.get(row.employeeId);
      return {
        id: row.id,
        rowTone:
          toneForStatus(row.eligibilityStatus) ??
          toneForStatus(profile?.riskLevel ?? ""),
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          siteName: row.siteName,
          departmentRole: `${row.departmentName} / ${row.roleName}`,
          managerDisplayName: row.managerDisplayName,
          requiredTraining: formatList(profile?.requiredTrainingTypes),
          riskLevel: formatEnumLabel(profile?.riskLevel),
          eligibilityStatus: formatEnumLabel(row.eligibilityStatus),
          flags: formatList(row.flags),
        },
      } satisfies HrIndustryMscListRow;
    });
}

function buildTrainingRows(
  store: HrIndustryMscStore,
  input: HrIndustryMscPageModelInput,
): HrIndustryMscListRow[] {
  return store.trainingAssignments
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        employeeDisplayName: row.employeeDisplayName,
        trainingType: formatEnumLabel(row.trainingType),
        assignedAt: formatDate(row.assignedAt),
        dueDate: formatDate(row.dueDate),
        completedAt: formatDate(row.completedAt),
        evidence:
          row.evidenceDocumentRef ??
          row.ppeAcknowledgmentRef ??
          "Evidence pending",
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildHazardRows(
  rows: readonly HrMscHazardAssessmentInput[],
  input: HrIndustryMscPageModelInput,
): HrIndustryMscListRow[] {
  return rows
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.riskLevel) ?? toneForStatus(row.status),
      cells: {
        assessmentType: formatEnumLabel(row.assessmentType),
        siteWorkArea: `${row.siteName} / ${row.workArea}`,
        departmentName: row.departmentName,
        roleTask: `${row.roleName ?? "Any role"} / ${row.taskName ?? "Any task"}`,
        machineName: row.machineName ?? "Not machine-specific",
        riskLevel: formatEnumLabel(row.riskLevel),
        controls: formatList(row.requiredControls),
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildIncidentRows(
  rows: readonly HrMscWorkplaceIncidentInput[],
  input: HrIndustryMscPageModelInput,
): HrIndustryMscListRow[] {
  return rows
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status) ?? toneForStatus(row.severity),
      cells: {
        incidentDate: formatDate(row.incidentDate),
        siteDepartment: `${row.siteName} / ${row.departmentName}`,
        employeeDisplayName: redact(row.employeeDisplayName, input.canReadRestricted),
        incidentType: formatEnumLabel(row.incidentType),
        severity: input.canReadRestricted
          ? formatEnumLabel(row.severity)
          : "Restricted",
        description: redact(row.description, input.canReadRestricted),
        oshaRefs: row.oshaRecordable ? formatList(row.oshaFormRefs) : "Not recordable",
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildCorrectiveActionRows(
  rows: readonly HrMscCorrectiveActionInput[],
  input: HrIndustryMscPageModelInput,
): HrIndustryMscListRow[] {
  return rows
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status) ?? toneForStatus(row.priority),
      cells: {
        source: `${formatEnumLabel(row.sourceType)} / ${row.sourceRef}`,
        ownerDisplayName: row.ownerDisplayName,
        dueDate: formatDate(row.dueDate),
        priority: formatEnumLabel(row.priority),
        evidence: redact(row.evidenceDocumentRef, input.canReadRestricted),
        completedAt: formatDate(row.completedAt),
        status: formatEnumLabel(row.status),
      },
    }));
}

function workRestrictionTone(
  row: HrMscWorkRestrictionInput,
): HrIndustryMscListRow["rowTone"] {
  if (row.status === "active") return "critical";
  return toneForStatus(row.status);
}

export async function buildHrIndustryMscPageModel(
  input: HrIndustryMscPageModelInput,
): Promise<HrIndustryMscPageModel> {
  const store = getHrIndustryMscStore(input.organizationId);
  const visibleStore = filterHrIndustryMscRecordsForAccess({
    store,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });
  const eligibilityRows = listHrIndustryMscSafetyEligibilityRecords(visibleStore);
  const reportRows = buildHrIndustryMscReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });
  const overview = buildHrIndustryMscOverviewStatGrid({
    snapshot: {
      requiredTrainingCount: visibleStore.trainingAssignments.length,
      overdueTrainingCount: visibleStore.trainingAssignments.filter(
        (row) => row.status === "overdue",
      ).length,
      expiringCertificationCount: visibleStore.safetyCertifications.filter(
        (row) => row.status === "expiring" || row.status === "renewal_due",
      ).length,
      activeRestrictionCount: visibleStore.workRestrictions.filter(
        (row) => row.status === "active",
      ).length,
      openIncidentCount: visibleStore.workplaceIncidents.filter(
        (row) => row.status !== "closed",
      ).length,
      overdueCorrectiveActionCount: visibleStore.correctiveActions.filter(
        (row) => row.status === "overdue",
      ).length,
    },
  });

  const sections: HrIndustryMscPageModelListSection[] = [
    section({
      surfaceKey: hrIndustryMscRequirementsSurfaceKey,
      searchValue: input.requirementsSearch,
      rows: filterRows(
        buildRequirementRows(visibleStore, input),
        input.requirementsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryMscEmployeeObligationsSurfaceKey,
      searchValue: input.employeeObligationsSearch,
      rows: filterRows(
        buildEligibilityRows({
          store: visibleStore,
          eligibilityRows,
          pageInput: input,
        }),
        input.employeeObligationsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryMscTrainingAssignmentsSurfaceKey,
      searchValue: input.trainingAssignmentsSearch,
      rows: filterRows(
        buildTrainingRows(visibleStore, input),
        input.trainingAssignmentsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryMscCertificationsSurfaceKey,
      searchValue: input.certificationsSearch,
      rows: filterRows(
        visibleStore.safetyCertifications.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.certificationsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          certificationType: row.certificationType,
          machineWorkArea: row.machineId ?? row.workArea ?? "Not assigned",
          issuingAuthority: row.issuingAuthority,
          issueDate: formatDate(row.issueDate),
          expiryDate: formatDate(row.expiryDate),
          renewalDate: formatDate(row.renewalDate),
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryMscWorkRestrictionsSurfaceKey,
      searchValue: input.workRestrictionsSearch,
      rows: filterRows(
        visibleStore.workRestrictions.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.workRestrictionsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: workRestrictionTone(row),
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          restrictionScope: formatEnumLabel(row.restrictionScope),
          restrictionTarget: row.restrictionTarget,
          reason: formatEnumLabel(row.reason),
          effectiveFrom: formatDate(row.effectiveFrom),
          shiftSchedulingRef: row.shiftSchedulingRef ?? "Not exposed",
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryMscHazardAssessmentsSurfaceKey,
      searchValue: input.hazardAssessmentsSearch,
      rows: filterRows(
        buildHazardRows(visibleStore.hazardAssessments, input),
        input.hazardAssessmentsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryMscIncidentsSurfaceKey,
      searchValue: input.incidentsSearch,
      rows: filterRows(
        buildIncidentRows(visibleStore.workplaceIncidents, input),
        input.incidentsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryMscCorrectiveActionsSurfaceKey,
      searchValue: input.correctiveActionsSearch,
      rows: filterRows(
        buildCorrectiveActionRows(visibleStore.correctiveActions, input),
        input.correctiveActionsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryMscNotificationsSurfaceKey,
      searchValue: input.notificationsSearch,
      rows: filterRows(
        visibleStore.notifications.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.notificationsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.notificationType) ?? toneForStatus(row.status),
        cells: {
          notificationType: formatEnumLabel(row.notificationType),
          employeeDisplayName: row.employeeDisplayName ?? "Audience notice",
          recipients: row.recipients.join(", "),
          targetRef: row.targetRef,
          dueDate: formatDate(row.dueDate),
          generatedAt: formatDate(row.generatedAt),
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryMscEvidenceLinksSurfaceKey,
      searchValue: input.evidenceLinksSearch,
      rows: filterRows(
        visibleStore.evidenceLinks,
        input.evidenceLinksSearch,
      ).map((row) => ({
        id: row.id,
        cells: {
          evidenceType: formatEnumLabel(row.evidenceType),
          employeeDisplayName: row.employeeDisplayName ?? "Shared evidence",
          targetRef: row.targetRef,
          documentRef: redact(row.documentRef, input.canReadRestricted),
          documentManagementRef: redact(
            row.documentManagementRef,
            input.canReadRestricted,
          ),
          linkedAt: formatDate(row.linkedAt),
          linkedBy: row.linkedBy,
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryMscReportsSurfaceKey,
      searchValue: input.reportsSearch,
      rows: filterRows(reportRows, input.reportsSearch).map((row) => ({
        id: row.id,
        rowTone:
          row.overdueTrainingCount +
            row.openCorrectiveActionCount +
            row.restrictionCount >
          0
            ? "critical"
            : row.expiringCertificationCount + row.incidentCount > 0
              ? "attention"
              : undefined,
        cells: {
          groupLabel: row.groupLabel,
          requiredEmployeeCount: row.requiredEmployeeCount,
          overdueTrainingCount: row.overdueTrainingCount,
          expiringCertificationCount: row.expiringCertificationCount,
          incidentCount: row.incidentCount,
          openCorrectiveActionCount: row.openCorrectiveActionCount,
          restrictionCount: row.restrictionCount,
          readinessPercent: `${row.readinessPercent}%`,
        },
      })),
    }),
  ];

  if (input.canExposeIntegrations) {
    sections.push(
      section({
        surfaceKey: hrIndustryMscIntegrationExposuresSurfaceKey,
        searchValue: input.integrationExposuresSearch,
        rows: filterRows(
          visibleStore.integrationExposures,
          input.integrationExposuresSearch,
        ).map((row) => ({
          id: row.id,
          rowTone: toneForStatus(row.status),
          cells: {
            integrationTarget: formatEnumLabel(row.integrationTarget),
            employeeDisplayName: row.employeeDisplayName ?? "Shared reference",
            sourceRef: row.sourceRef,
            summary: row.summary,
            exposedAt: formatDate(row.exposedAt),
            status: formatEnumLabel(row.status),
          },
        })),
      }),
    );
  }

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: hrIndustryMscAuditTrailSurfaceKey,
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
    title: hrIndustryMscUiCopy.page.title,
    description: hrIndustryMscUiCopy.page.description,
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
          candidate.surfaceKey === hrIndustryMscEmployeeObligationsSurfaceKey,
      )?.listConfiguration ??
      buildHrIndustryMscListSurface({
        surfaceKey: hrIndustryMscEmployeeObligationsSurfaceKey,
        rows: [],
      }),
  };
}
