import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrIndustryFhcListRow } from "../contracts/hr.industry.fhc.contract";
import { buildHrIndustryFhcListSurface } from "../surface/hr.industry.fhc-lists.surface";
import { buildHrIndustryFhcOverviewStatGrid } from "../surface/hr.industry.fhc-overview-stat.surface";
import {
  hrIndustryFhcAlertsSurfaceKey,
  hrIndustryFhcAuditTrailSurfaceKey,
  hrIndustryFhcDutyRestrictionsSurfaceKey,
  hrIndustryFhcEmployeeComplianceSurfaceKey,
  hrIndustryFhcEvidenceSubmissionsSurfaceKey,
  hrIndustryFhcHealthCertificationsSurfaceKey,
  hrIndustryFhcIntegrationExposuresSurfaceKey,
  hrIndustryFhcPermitsSurfaceKey,
  hrIndustryFhcRenewalCasesSurfaceKey,
  hrIndustryFhcReportsSurfaceKey,
  hrIndustryFhcRequirementRulesSurfaceKey,
  hrIndustryFhcTrainingCompletionsSurfaceKey,
  type HrIndustryFhcListSurfaceKey,
} from "../surface/hr.industry.fhc-surface-metadata.shared";
import { hrIndustryFhcUiCopy } from "../surface/hr.industry.fhc-ui.copy.shared";
import type { HrIndustryFhcPageModelInput } from "./hr.industry.fhc-search-params.parse.shared";
import {
  buildHrIndustryFhcReportRows,
  filterHrIndustryFhcRecordsForAccess,
  getHrIndustryFhcStore,
  listHrIndustryFhcEligibilityRecords,
  type HrIndustryFhcStore,
} from "./hr.industry.fhc-store.shared";

const FHC_DEFAULT_PAGE_SIZE = 25;

export type HrIndustryFhcPageModelListSection = {
  readonly surfaceKey: HrIndustryFhcListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrIndustryFhcPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrIndustryFhcPageModelInput["reportGroupBy"];
  readonly status: HrIndustryFhcPageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrIndustryFhcPageModelListSection[];
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

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, FHC_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, FHC_DEFAULT_PAGE_SIZE);
}

function toneForStatus(value: string): HrIndustryFhcListRow["rowTone"] {
  if (
    [
      "critical",
      "expired",
      "missing",
      "rejected",
      "restricted",
      "permit_expired",
      "health_certificate_missing",
      "training_overdue",
      "active",
      "unfit",
    ].includes(value)
  ) {
    return "critical";
  }
  if (
    [
      "pending",
      "pending_review",
      "expiring",
      "submitted",
      "renewal_pending",
      "open",
      "warning",
      "overdue",
    ].includes(value)
  ) {
    return "attention";
  }
  return undefined;
}

function section(input: {
  readonly surfaceKey: HrIndustryFhcListSurfaceKey;
  readonly rows: readonly HrIndustryFhcListRow[];
  readonly searchValue?: string;
}): HrIndustryFhcPageModelListSection {
  const copy = hrIndustryFhcUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrIndustryFhcListSurface(input),
  };
}

function requirementsLabel(input: {
  readonly permit: boolean;
  readonly health: boolean;
  readonly foodTraining: boolean;
  readonly allergenTraining: boolean;
}) {
  return [
    input.permit ? "Permit" : null,
    input.health ? "Health" : null,
    input.foodTraining ? "Food hygiene" : null,
    input.allergenTraining ? "Allergen" : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function redactSensitive(value: string | undefined, canReadRestricted: boolean) {
  if (!canReadRestricted) return "Restricted";
  return value ?? "Not linked";
}

function buildEmployeeComplianceRows(
  store: HrIndustryFhcStore,
  input: HrIndustryFhcPageModelInput,
): HrIndustryFhcListRow[] {
  const requirementByEmployee = new Map(
    store.employeeRequirements.map((row) => [row.employeeId, row]),
  );
  return listHrIndustryFhcEligibilityRecords(store)
    .filter((row) => input.status === "all" || row.complianceStatus === input.status)
    .map((row) => {
      const requirement = requirementByEmployee.get(row.employeeId);
      return {
        id: row.id,
        rowTone:
          toneForStatus(row.complianceStatus) ??
          toneForStatus(row.eligibilityStatus),
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          outletName: requirement?.outletName ?? "Not assigned",
          roleName: requirement?.roleName ?? "Not assigned",
          managerDisplayName: requirement?.managerDisplayName ?? "Not assigned",
          complianceStatus: formatEnumLabel(row.complianceStatus),
          eligibilityStatus: formatEnumLabel(row.eligibilityStatus),
          flags: row.flags.length > 0 ? row.flags.map(formatEnumLabel).join(", ") : "Clear",
        },
      };
    });
}

export async function buildHrIndustryFhcPageModel(
  input: HrIndustryFhcPageModelInput,
): Promise<HrIndustryFhcPageModel> {
  const store = getHrIndustryFhcStore(input.organizationId);
  const visibleStore = filterHrIndustryFhcRecordsForAccess({
    store,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });
  const eligibilityRows = listHrIndustryFhcEligibilityRecords(visibleStore);
  const employeeComplianceRows = buildEmployeeComplianceRows(visibleStore, input);
  const reportRows = buildHrIndustryFhcReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });
  const overview = buildHrIndustryFhcOverviewStatGrid({
    snapshot: {
      requiredEmployeeCount: visibleStore.employeeRequirements.filter(
        (row) => row.requiresCertification || row.requiresHealthCertificate,
      ).length,
      eligibleEmployeeCount: eligibilityRows.filter(
        (row) => row.eligibilityStatus === "eligible",
      ).length,
      restrictedEmployeeCount: eligibilityRows.filter(
        (row) => row.eligibilityStatus === "restricted",
      ).length,
      expiringCertificateCount: eligibilityRows.filter(
        (row) =>
          row.flags.includes("permit_expiring") ||
          row.flags.includes("health_certificate_expiring"),
      ).length,
      overdueTrainingCount: eligibilityRows.filter((row) =>
        row.flags.includes("overdue_training"),
      ).length,
      openAlertCount: visibleStore.alerts.filter((row) => row.status === "open")
        .length,
    },
  });

  const sections: HrIndustryFhcPageModelListSection[] = [
    section({
      surfaceKey: hrIndustryFhcRequirementRulesSurfaceKey,
      searchValue: input.requirementRulesSearch,
      rows: filterRows(
        visibleStore.requirementRules,
        input.requirementRulesSearch,
      ).map((rule) => ({
        id: rule.id,
        cells: {
          outletName: rule.outletName,
          country: rule.country,
          legalEntity: rule.legalEntity,
          roleName: rule.roleName,
          departmentName: rule.departmentName,
          requirements: requirementsLabel({
            permit: rule.requiresFoodHandlerPermit,
            health: rule.requiresHealthCertificate,
            foodTraining: rule.requiresFoodHygieneTraining,
            allergenTraining: rule.requiresAllergenTraining,
          }),
          renewalLeadDays: `${rule.renewalLeadDays} days`,
          status: formatEnumLabel(rule.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryFhcEmployeeComplianceSurfaceKey,
      searchValue: input.employeeComplianceSearch,
      rows: filterRows(employeeComplianceRows, input.employeeComplianceSearch),
    }),
    section({
      surfaceKey: hrIndustryFhcPermitsSurfaceKey,
      searchValue: input.permitsSearch,
      rows: filterRows(visibleStore.permits, input.permitsSearch).map((permit) => {
        const derived = eligibilityRows.find(
          (row) => row.employeeId === permit.employeeId,
        );
        return {
          id: permit.id,
          rowTone:
            toneForStatus(derived?.complianceStatus ?? permit.status) ??
            toneForStatus(permit.status),
          cells: {
            employeeDisplayName: permit.employeeDisplayName,
            permitNumber: permit.permitNumber,
            issuingAuthority: permit.issuingAuthority,
            issueDate: formatDate(permit.issueDate),
            expiryDate: formatDate(permit.expiryDate),
            status: formatEnumLabel(derived?.complianceStatus ?? permit.status),
            documentRef: permit.documentRef ?? "Not linked",
          },
        };
      }),
    }),
    section({
      surfaceKey: hrIndustryFhcHealthCertificationsSurfaceKey,
      searchValue: input.healthCertificationsSearch,
      rows: filterRows(
        visibleStore.healthCertifications,
        input.healthCertificationsSearch,
      ).map((health) => ({
        id: health.id,
        rowTone:
          toneForStatus(health.status) ??
          toneForStatus(health.medicalFitnessStatus),
        cells: {
          employeeDisplayName: health.employeeDisplayName,
          providerName: redactSensitive(
            health.providerName,
            input.canReadRestricted,
          ),
          screeningRef: redactSensitive(
            health.screeningRef,
            input.canReadRestricted,
          ),
          medicalFitnessStatus: input.canReadRestricted
            ? formatEnumLabel(health.medicalFitnessStatus)
            : "Restricted",
          expiryDate: formatDate(health.expiryDate),
          status: formatEnumLabel(health.status),
          documentRef: redactSensitive(health.documentRef, input.canReadRestricted),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryFhcTrainingCompletionsSurfaceKey,
      searchValue: input.trainingCompletionsSearch,
      rows: filterRows(
        visibleStore.trainingCompletions,
        input.trainingCompletionsSearch,
      ).map((training) => ({
        id: training.id,
        rowTone: toneForStatus(training.status),
        cells: {
          employeeDisplayName: training.employeeDisplayName,
          trainingType: formatEnumLabel(training.trainingType),
          requirementRef: training.requirementRef,
          dueDate: formatDate(training.dueDate),
          completedAt: formatDate(training.completedAt),
          status: formatEnumLabel(training.status),
          evidenceDocumentRef: training.evidenceDocumentRef ?? "Not linked",
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryFhcEvidenceSubmissionsSurfaceKey,
      searchValue: input.evidenceSubmissionsSearch,
      rows: filterRows(
        visibleStore.evidenceSubmissions,
        input.evidenceSubmissionsSearch,
      ).map((evidence) => {
        const sensitive =
          evidence.evidenceType === "health_certificate" ||
          evidence.evidenceType === "medical_fitness";
        return {
          id: evidence.id,
          rowTone: toneForStatus(evidence.status),
          cells: {
            employeeDisplayName: evidence.employeeDisplayName,
            evidenceType: formatEnumLabel(evidence.evidenceType),
            targetRef: evidence.targetRef,
            documentRef:
              sensitive && !input.canReadRestricted
                ? "Restricted"
                : evidence.documentRef,
            submittedAt: formatDate(evidence.submittedAt),
            status: formatEnumLabel(evidence.status),
            decision:
              evidence.status === "rejected"
                ? input.canReadRestricted
                  ? (evidence.rejectionReason ?? "Rejected")
                  : "Restricted"
                : evidence.verifiedBy ?? "Pending review",
          },
        };
      }),
    }),
    section({
      surfaceKey: hrIndustryFhcRenewalCasesSurfaceKey,
      searchValue: input.renewalCasesSearch,
      rows: filterRows(
        visibleStore.renewalCases,
        input.renewalCasesSearch,
      ).map((renewal) => ({
        id: renewal.id,
        rowTone: toneForStatus(renewal.status),
        cells: {
          employeeDisplayName: renewal.employeeDisplayName,
          certificateType: formatEnumLabel(renewal.certificateType),
          targetRef: renewal.targetRef,
          dueDate: formatDate(renewal.dueDate),
          submittedAt: formatDate(renewal.submittedAt),
          verifiedAt: formatDate(renewal.verifiedAt),
          status: formatEnumLabel(renewal.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryFhcAlertsSurfaceKey,
      searchValue: input.alertsSearch,
      rows: filterRows(visibleStore.alerts, input.alertsSearch).map((alert) => ({
        id: alert.id,
        rowTone: toneForStatus(alert.alertType) ?? toneForStatus(alert.severity),
        cells: {
          employeeDisplayName: alert.employeeDisplayName,
          alertType: formatEnumLabel(alert.alertType),
          severity: formatEnumLabel(alert.severity),
          status: formatEnumLabel(alert.status),
          targetRef:
            alert.alertType.includes("health") && !input.canReadRestricted
              ? "Restricted"
              : alert.targetRef,
          dueDate: formatDate(alert.dueDate),
          generatedAt: formatDate(alert.generatedAt),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryFhcDutyRestrictionsSurfaceKey,
      searchValue: input.dutyRestrictionsSearch,
      rows: filterRows(
        visibleStore.dutyRestrictions,
        input.dutyRestrictionsSearch,
      ).map((restriction) => ({
        id: restriction.id,
        rowTone: toneForStatus(restriction.status),
        cells: {
          employeeDisplayName: restriction.employeeDisplayName,
          reason: formatEnumLabel(restriction.reason),
          effectiveFrom: formatDate(restriction.effectiveFrom),
          effectiveTo: formatDate(restriction.effectiveTo),
          status: formatEnumLabel(restriction.status),
          reviewerEmployeeId: restriction.reviewerEmployeeId ?? "Pending",
          shiftSchedulingRef: restriction.shiftSchedulingRef ?? "Not exposed",
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryFhcReportsSurfaceKey,
      searchValue: input.reportsSearch,
      rows: filterRows(reportRows, input.reportsSearch).map((row) => ({
        id: row.id,
        rowTone:
          row.expiredPermitCount + row.missingCertificationCount > 0
            ? "critical"
            : row.expiringPermitCount + row.overdueTrainingCount > 0
              ? "attention"
              : undefined,
        cells: {
          groupLabel: row.groupLabel,
          requiredEmployeeCount: row.requiredEmployeeCount,
          compliantCount: row.compliantCount,
          expiredPermitCount: row.expiredPermitCount,
          expiringPermitCount: row.expiringPermitCount,
          missingCertificationCount: row.missingCertificationCount,
          overdueTrainingCount: row.overdueTrainingCount,
          outletReadinessPercent: `${row.outletReadinessPercent}%`,
        },
      })),
    }),
  ];

  if (input.canExposeIntegrations) {
    sections.push(
      section({
        surfaceKey: hrIndustryFhcIntegrationExposuresSurfaceKey,
        searchValue: input.integrationExposuresSearch,
        rows: filterRows(
          visibleStore.integrationExposures,
          input.integrationExposuresSearch,
        ).map((row) => ({
          id: row.id,
          rowTone: toneForStatus(row.status),
          cells: {
            employeeDisplayName: row.employeeDisplayName,
            integrationTarget: formatEnumLabel(row.integrationTarget),
            sourceRef: row.sourceRef,
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
        surfaceKey: hrIndustryFhcAuditTrailSurfaceKey,
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
    title: hrIndustryFhcUiCopy.page.title,
    description: hrIndustryFhcUiCopy.page.description,
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
      sections[1]?.listConfiguration ??
      buildHrIndustryFhcListSurface({
        surfaceKey: hrIndustryFhcEmployeeComplianceSurfaceKey,
        rows: [],
      }),
  };
}
