import {
  ensureHrWorkAuthorizationDocuments,
  ensureHrWorkEligibilityTracking,
  listHrComplianceAlertsWindow,
  listHrComplianceReviewQueueWindow,
  listHrComplianceEvidenceLinksWindow,
  listHrComplianceExceptionsWindow,
  listHrComplianceFilingsWindow,
  listHrComplianceObligationsWindow,
  listHrComplianceRegulatoryCalendarWindow,
  listHrDepartments,
  listHrEmployeeDirectoryWindow,
  listHrEmployeeDocumentsWindow,
  listHrEmployeeLaborLawRequirementsWindow,
  listHrEmployeeStatutoryRequirementsWindow,
  listHrEmployeePolicyAcknowledgementsWindow,
  listHrEmployeeSafetyTrainingRequirementsWindow,
  listHrEmployeeWorkplaceSafetyRequirementsWindow,
  listHrWorkAuthorizationDocumentsWindow,
  listHrWorkEligibilityWindow,
  syncHrEmployeeLaborLawRequirements,
  syncHrEmployeeStatutoryRequirements,
  syncHrEmployeePolicyAcknowledgements,
  loadHrComplianceOverviewSnapshot,
  syncHrComplianceFilings,
  syncHrEmployeeSafetyTrainingRequirements,
  syncHrEmployeeWorkplaceSafetyRequirements,
  syncHrComplianceExceptions,
} from "@afenda/db";

import type { HrComplianceDocumentPickerOption } from "./hr.workforce.compliance-evidence-links.shared";
import type { EmptyState } from "@afenda/governed-surface/schemas";

import {
  buildComplianceListLoadErrorPlaceholder,
  settleComplianceListLoad,
} from "./hr.workforce.compliance-list-load.shared";
import { buildHrComplianceFilingsListSurface } from "./hr.workforce.compliance-filings-list.surface";
import {
  hrComplianceFilingSearchParam,
} from "./hr.workforce.compliance-filings-list.surface";
import { buildHrComplianceExceptionsListSurface } from "./hr.workforce.compliance-exceptions-list.surface";
import {
  hrComplianceExceptionSearchParam,
} from "./hr.workforce.compliance-exceptions-list.surface";
import { buildHrComplianceLaborLawRequirementsListSurface } from "./hr.workforce.compliance-labor-law-requirements-list.surface";
import {
  hrComplianceLaborLawSearchParam,
} from "./hr.workforce.compliance-labor-law-requirements-list.surface";
import { buildHrComplianceStatutoryRequirementsListSurface } from "./hr.workforce.compliance-statutory-requirements-list.surface";
import {
  hrComplianceStatutorySearchParam,
} from "./hr.workforce.compliance-statutory-requirements-list.surface";
import { buildHrComplianceOverviewBreakdownListSurface } from "./hr.workforce.compliance-overview-breakdown-list.surface";
import { buildHrComplianceOverviewStatGroups } from "./hr.workforce.compliance-overview-stat.surface";
import { hrComplianceOverviewBreakdownColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { buildHrComplianceObligationsListSurface } from "./hr.workforce.compliance-obligations-list.surface";
import {
  hrComplianceObligationSearchParam,
} from "./hr.workforce.compliance-obligations-list.surface";
import {
  buildHrComplianceSafetyTrainingRequirementsListSurface,
  hrComplianceSafetyTrainingSearchParam,
} from "./hr.workforce.compliance-safety-training-requirements-list.surface";
import {
  buildHrComplianceWorkAuthDocumentsListSurface,
  hrComplianceWorkAuthDocumentSearchParam,
} from "./hr.workforce.compliance-work-auth-documents-list.surface";
import {
  hrComplianceWorkEligibilitySearchParam,
} from "./hr.workforce.compliance-work-eligibility-list.surface";
import {
  hrComplianceWorkplaceSafetySearchParam,
} from "./hr.workforce.compliance-workplace-safety-list.surface";
import {
  buildHrCompliancePolicyAcknowledgementsListSurface,
  hrCompliancePolicyAcknowledgementSearchParam,
} from "./hr.workforce.compliance-policy-acknowledgements-list.surface";
import { buildHrComplianceWorkEligibilityListSurface } from "./hr.workforce.compliance-work-eligibility-list.surface";
import { buildHrComplianceWorkplaceSafetyRequirementsListSurface } from "./hr.workforce.compliance-workplace-safety-list.surface";
import {
  buildHrComplianceRegulatoryCalendarListSurface,
  hrComplianceRegulatoryCalendarSearchParam,
} from "./hr.workforce.compliance-regulatory-calendar-list.surface";
import {
  buildHrComplianceAlertsListSurface,
  hrComplianceAlertsSearchParam,
} from "./hr.workforce.compliance-alerts-list.surface";
import {
  buildHrComplianceReviewQueueListSurface,
  hrComplianceReviewQueueSearchParam,
} from "./hr.workforce.compliance-review-queue-list.surface";
import {
  buildHrComplianceEvidenceLinksListSurface,
  hrComplianceEvidenceLinksSearchParam,
} from "./hr.workforce.compliance-evidence-links-list.surface";
import {
  buildHrComplianceAuditTrailListSurface,
  hrComplianceAuditTrailSearchParam,
} from "./hr.workforce.compliance-audit-trail-list.surface";
import { listHrComplianceAuditTrailWindow } from "./hr.workforce.compliance.audit-trail.shared.server";
import {
  HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY,
  hrComplianceAlertsSurfaceKey,
  hrComplianceReviewQueueSurfaceKey,
  hrComplianceEvidenceLinksSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceStatutoryRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceAuditTrailSurfaceKey,
} from "./hr.workforce.compliance-surface-metadata.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";
import { filterComplianceDocumentPickerOptions } from "./hr.workforce.compliance-sensitive-access.shared";

export type HrCompliancePageModelInput = {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  /** Applies to all lists when specific search params are omitted. */
  search?: string;
  obligationSearch?: string;
  exceptionSearch?: string;
  laborLawSearch?: string;
  statutorySearch?: string;
  policyAcknowledgementSearch?: string;
  safetyTrainingSearch?: string;
  workplaceSafetySearch?: string;
  workEligibilitySearch?: string;
  workAuthDocumentSearch?: string;
  filingSearch?: string;
  regulatoryCalendarSearch?: string;
  alertsSearch?: string;
  reviewQueueSearch?: string;
  evidenceLinksSearch?: string;
  auditTrailSearch?: string;
  obligationLimit?: number;
  exceptionLimit?: number;
  laborLawLimit?: number;
  statutoryLimit?: number;
  policyAcknowledgementLimit?: number;
  safetyTrainingLimit?: number;
  workplaceSafetyLimit?: number;
  workEligibilityLimit?: number;
  workAuthDocumentLimit?: number;
  filingLimit?: number;
  regulatoryCalendarLimit?: number;
  alertsLimit?: number;
  reviewQueueLimit?: number;
  evidenceLinksLimit?: number;
  auditTrailLimit?: number;
};

async function loadComplianceDepartmentOptions(organizationId: string) {
  try {
    const departments = await listHrDepartments({ organizationId });
    return departments.map((department) => ({
      id: department.id,
      name: department.name,
    }));
  } catch {
    return [] as Array<{ id: string; name: string }>;
  }
}

const COMPLIANCE_EMPLOYEE_PICKER_LIMIT = 200;
const COMPLIANCE_DOCUMENT_PICKER_LIMIT = 200;

async function loadComplianceEmployeePickerOptions(organizationId: string) {
  try {
    const directory = await listHrEmployeeDirectoryWindow({
      organizationId,
      limit: COMPLIANCE_EMPLOYEE_PICKER_LIMIT,
    });
    return directory.rows
      .filter((employee) => employee.employmentStatus === "active")
      .map((employee) => ({
      value: employee.id,
      label: `${employee.displayName} (${employee.employeeNumber})`,
    }));
  } catch {
    return [] as Array<{ value: string; label: string }>;
  }
}

async function loadComplianceDocumentPickerOptions(
  organizationId: string,
  canViewSensitive: boolean,
): Promise<readonly HrComplianceDocumentPickerOption[]> {
  try {
    const window = await listHrEmployeeDocumentsWindow({
      organizationId,
      limit: COMPLIANCE_DOCUMENT_PICKER_LIMIT,
    });
    return filterComplianceDocumentPickerOptions(
      window.rows.map((document) => ({
        value: document.id,
        label: `${document.title} (${document.employeeDisplayName} · ${document.documentType})`,
        employeeId: document.employeeId,
        classification: document.classification,
      })),
      canViewSensitive,
    ).map(({ value, label, employeeId }) => ({
      value,
      label,
      employeeId,
    }));
  } catch {
    return [] as const;
  }
}

/** Idempotent source sync/ensure steps — must complete before exception materialization (HRM-CMP-017). */
export async function runHrComplianceSourceSyncSteps(input: {
  organizationId: string;
}) {
  await Promise.allSettled([
    syncHrComplianceFilings({
      organizationId: input.organizationId,
    }),
    syncHrEmployeeLaborLawRequirements({
      organizationId: input.organizationId,
    }),
    syncHrEmployeeStatutoryRequirements({
      organizationId: input.organizationId,
    }),
    syncHrEmployeePolicyAcknowledgements({
      organizationId: input.organizationId,
    }),
    syncHrEmployeeSafetyTrainingRequirements({
      organizationId: input.organizationId,
    }),
    syncHrEmployeeWorkplaceSafetyRequirements({
      organizationId: input.organizationId,
    }),
    ensureHrWorkEligibilityTracking({
      organizationId: input.organizationId,
    }),
    ensureHrWorkAuthorizationDocuments({
      organizationId: input.organizationId,
    }),
  ]);
}

/** Runs source sync first, then exception auto-sync (HRM-CMP-017). Intentionally no audit — see HRM-CMP-025 audit scope boundaries. */
export async function runHrCompliancePageLoadSync(input: { organizationId: string }) {
  await runHrComplianceSourceSyncSteps(input);
  await Promise.allSettled([
    syncHrComplianceExceptions({
      organizationId: input.organizationId,
    }),
  ]);
}

/** Department options for obligation scope pickers. Caller must enforce read access. */
export async function loadComplianceFormOptions(organizationId: string) {
  return {
    departments: await loadComplianceDepartmentOptions(organizationId),
    employeePickerOptions:
      await loadComplianceEmployeePickerOptions(organizationId),
  };
}

const emptyOverviewSnapshot = {
  openExceptionCount: 0,
  criticalAlertCount: 0,
  overdueFilingCount: 0,
  pendingReviewCount: 0,
  atRiskRequirementCount: 0,
  overdueRequirementCount: 0,
  dimensionBreakdown: [],
} as const;

export async function buildHrCompliancePageModel(input: HrCompliancePageModelInput) {
  const obligationSearch = input.obligationSearch ?? input.search;
  const exceptionSearch = input.exceptionSearch ?? input.search;
  const laborLawSearch = input.laborLawSearch ?? input.search;
  const statutorySearch = input.statutorySearch ?? input.search;
  const policyAcknowledgementSearch =
    input.policyAcknowledgementSearch ?? input.search;
  const safetyTrainingSearch = input.safetyTrainingSearch ?? input.search;
  const workplaceSafetySearch = input.workplaceSafetySearch ?? input.search;
  const workEligibilitySearch = input.workEligibilitySearch ?? input.search;
  const workAuthDocumentSearch = input.workAuthDocumentSearch ?? input.search;
  const filingSearch = input.filingSearch ?? input.search;
  const regulatoryCalendarSearch =
    input.regulatoryCalendarSearch ?? input.search;
  const alertsSearch = input.alertsSearch ?? input.search;
  const reviewQueueSearch = input.reviewQueueSearch ?? input.search;
  const evidenceLinksSearch = input.evidenceLinksSearch ?? input.search;
  const auditTrailSearch = input.auditTrailSearch ?? input.search;
  const copy = hrComplianceUiCopy;

  const [, departments, employeePickerOptions, documentPickerOptions] =
    await Promise.all([
    runHrCompliancePageLoadSync({ organizationId: input.organizationId }),
    loadComplianceDepartmentOptions(input.organizationId),
    loadComplianceEmployeePickerOptions(input.organizationId),
    loadComplianceDocumentPickerOptions(
      input.organizationId,
      input.canViewSensitive,
    ),
  ]);

  const [
    obligationsResult,
    filingsResult,
    exceptionsResult,
    laborLawResult,
    statutoryResult,
    policyAcknowledgementResult,
    safetyTrainingResult,
    workplaceSafetyResult,
    workEligibilityResult,
    workAuthDocumentsResult,
    regulatoryCalendarResult,
    alertsResult,
    reviewQueueResult,
    evidenceLinksResult,
    auditTrailResult,
    overviewResult,
  ] = await Promise.all([
    settleComplianceListLoad({
      sectionTitle: copy.obligations.sectionTitle,
      load: () =>
        listHrComplianceObligationsWindow({
          organizationId: input.organizationId,
          search: obligationSearch,
          limit: input.obligationLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.filing.sectionTitle,
      load: () =>
        listHrComplianceFilingsWindow({
          organizationId: input.organizationId,
          search: filingSearch,
          limit: input.filingLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.exceptions.sectionTitle,
      load: () =>
        listHrComplianceExceptionsWindow({
          organizationId: input.organizationId,
          search: exceptionSearch,
          openOnly: true,
          limit: input.exceptionLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.laborLaw.sectionTitle,
      load: () =>
        listHrEmployeeLaborLawRequirementsWindow({
          organizationId: input.organizationId,
          search: laborLawSearch,
          limit: input.laborLawLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.statutory.sectionTitle,
      load: () =>
        listHrEmployeeStatutoryRequirementsWindow({
          organizationId: input.organizationId,
          search: statutorySearch,
          limit: input.statutoryLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.policyAcknowledgement.sectionTitle,
      load: () =>
        listHrEmployeePolicyAcknowledgementsWindow({
          organizationId: input.organizationId,
          search: policyAcknowledgementSearch,
          limit: input.policyAcknowledgementLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.safetyTraining.sectionTitle,
      load: () =>
        listHrEmployeeSafetyTrainingRequirementsWindow({
          organizationId: input.organizationId,
          search: safetyTrainingSearch,
          limit: input.safetyTrainingLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.workplaceSafety.sectionTitle,
      load: () =>
        listHrEmployeeWorkplaceSafetyRequirementsWindow({
          organizationId: input.organizationId,
          search: workplaceSafetySearch,
          limit: input.workplaceSafetyLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.workEligibility.sectionTitle,
      load: () =>
        listHrWorkEligibilityWindow({
          organizationId: input.organizationId,
          search: workEligibilitySearch,
          limit: input.workEligibilityLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.workAuthDocuments.sectionTitle,
      load: () =>
        listHrWorkAuthorizationDocumentsWindow({
          organizationId: input.organizationId,
          search: workAuthDocumentSearch,
          limit: input.workAuthDocumentLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.regulatoryCalendar.sectionTitle,
      load: () =>
        listHrComplianceRegulatoryCalendarWindow({
          organizationId: input.organizationId,
          search: regulatoryCalendarSearch,
          limit: input.regulatoryCalendarLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.alerts.sectionTitle,
      load: () =>
        listHrComplianceAlertsWindow({
          organizationId: input.organizationId,
          search: alertsSearch,
          limit: input.alertsLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.reviewQueue.sectionTitle,
      load: () =>
        listHrComplianceReviewQueueWindow({
          organizationId: input.organizationId,
          search: reviewQueueSearch,
          limit: input.reviewQueueLimit,
          canViewSensitive: input.canViewSensitive,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.evidenceLinks.sectionTitle,
      load: () =>
        listHrComplianceEvidenceLinksWindow({
          organizationId: input.organizationId,
          search: evidenceLinksSearch,
          limit: input.evidenceLinksLimit,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.auditTrail.sectionTitle,
      load: () =>
        listHrComplianceAuditTrailWindow({
          organizationId: input.organizationId,
          search: auditTrailSearch,
          limit: input.auditTrailLimit,
          canViewSensitive: input.canViewSensitive,
        }),
    }),
    settleComplianceListLoad({
      sectionTitle: copy.overview.sectionTitle,
      load: () =>
        loadHrComplianceOverviewSnapshot({
          organizationId: input.organizationId,
          canViewSensitive: input.canViewSensitive,
        }),
    }),
  ]);

  return {
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    departments,
    employeePickerOptions,
    documentPickerOptions,
    obligationsList: obligationsResult.value
      ? buildHrComplianceObligationsListSurface({
          window: obligationsResult.value,
          searchValue: obligationSearch,
          canWrite: input.canWrite,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceObligationsSurfaceKey
            ],
          searchParam: hrComplianceObligationSearchParam,
          searchLabel: copy.obligations.searchLabel,
          searchPlaceholder: copy.obligations.searchPlaceholder,
          surfaceHeaderTitle: copy.obligations.surfaceHeaderTitle,
        }),
    obligationsLoadError: obligationsResult.loadError,
    filingsList: filingsResult.value
      ? buildHrComplianceFilingsListSurface({
          window: filingsResult.value,
          searchValue: filingSearch,
          canWrite: input.canWrite,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[hrComplianceFilingsSurfaceKey],
          searchParam: hrComplianceFilingSearchParam,
          searchLabel: copy.filing.searchLabel,
          searchPlaceholder: copy.filing.searchPlaceholder,
          surfaceHeaderTitle: copy.filing.surfaceHeaderTitle,
        }),
    filingsLoadError: filingsResult.loadError,
    exceptionsList: exceptionsResult.value
      ? buildHrComplianceExceptionsListSurface({
          window: exceptionsResult.value,
          searchValue: exceptionSearch,
          canWrite: input.canWrite,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceExceptionsSurfaceKey
            ],
          searchParam: hrComplianceExceptionSearchParam,
          searchLabel: copy.exceptions.searchLabel,
          searchPlaceholder: copy.exceptions.searchPlaceholder,
          surfaceHeaderTitle: copy.exceptions.surfaceHeaderTitle,
        }),
    exceptionsLoadError: exceptionsResult.loadError,
    laborLawRequirementsList: laborLawResult.value
      ? buildHrComplianceLaborLawRequirementsListSurface({
          window: laborLawResult.value,
          searchValue: laborLawSearch,
          canWrite: input.canWrite,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceLaborLawRequirementsSurfaceKey
            ],
          searchParam: hrComplianceLaborLawSearchParam,
          searchLabel: copy.laborLaw.searchLabel,
          searchPlaceholder: copy.laborLaw.searchPlaceholder,
          surfaceHeaderTitle: copy.laborLaw.surfaceHeaderTitle,
        }),
    laborLawRequirementsLoadError: laborLawResult.loadError,
    statutoryRequirementsList: statutoryResult.value
      ? buildHrComplianceStatutoryRequirementsListSurface({
          window: statutoryResult.value,
          searchValue: statutorySearch,
          canWrite: input.canWrite,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceStatutoryRequirementsSurfaceKey
            ],
          searchParam: hrComplianceStatutorySearchParam,
          searchLabel: copy.statutory.searchLabel,
          searchPlaceholder: copy.statutory.searchPlaceholder,
          surfaceHeaderTitle: copy.statutory.surfaceHeaderTitle,
        }),
    statutoryRequirementsLoadError: statutoryResult.loadError,
    policyAcknowledgementsList: policyAcknowledgementResult.value
      ? buildHrCompliancePolicyAcknowledgementsListSurface({
          window: policyAcknowledgementResult.value,
          searchValue: policyAcknowledgementSearch,
          canWrite: input.canWrite,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrCompliancePolicyAcknowledgementsSurfaceKey
            ],
          searchParam: hrCompliancePolicyAcknowledgementSearchParam,
          searchLabel: copy.policyAcknowledgement.searchLabel,
          searchPlaceholder: copy.policyAcknowledgement.searchPlaceholder,
          surfaceHeaderTitle: copy.policyAcknowledgement.surfaceHeaderTitle,
        }),
    policyAcknowledgementsLoadError: policyAcknowledgementResult.loadError,
    safetyTrainingRequirementsList: safetyTrainingResult.value
      ? buildHrComplianceSafetyTrainingRequirementsListSurface({
          window: safetyTrainingResult.value,
          searchValue: safetyTrainingSearch,
          canWrite: input.canWrite,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceSafetyTrainingRequirementsSurfaceKey
            ],
          searchParam: hrComplianceSafetyTrainingSearchParam,
          searchLabel: copy.safetyTraining.searchLabel,
          searchPlaceholder: copy.safetyTraining.searchPlaceholder,
          surfaceHeaderTitle: copy.safetyTraining.surfaceHeaderTitle,
        }),
    safetyTrainingRequirementsLoadError: safetyTrainingResult.loadError,
    workplaceSafetyRequirementsList: workplaceSafetyResult.value
      ? buildHrComplianceWorkplaceSafetyRequirementsListSurface({
          window: workplaceSafetyResult.value,
          searchValue: workplaceSafetySearch,
          canWrite: input.canWrite,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceWorkplaceSafetyRequirementsSurfaceKey
            ],
          searchParam: hrComplianceWorkplaceSafetySearchParam,
          searchLabel: copy.workplaceSafety.searchLabel,
          searchPlaceholder: copy.workplaceSafety.searchPlaceholder,
          surfaceHeaderTitle: copy.workplaceSafety.surfaceHeaderTitle,
        }),
    workplaceSafetyRequirementsLoadError: workplaceSafetyResult.loadError,
    workEligibilityList: workEligibilityResult.value
      ? buildHrComplianceWorkEligibilityListSurface({
          window: workEligibilityResult.value,
          searchValue: workEligibilitySearch,
          canWrite: input.canWrite,
          canViewSensitive: input.canViewSensitive,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceWorkEligibilitySurfaceKey
            ],
          searchParam: hrComplianceWorkEligibilitySearchParam,
          searchLabel: copy.workEligibility.searchLabel,
          searchPlaceholder: copy.workEligibility.searchPlaceholder,
          surfaceHeaderTitle: copy.workEligibility.surfaceHeaderTitle,
        }),
    workEligibilityLoadError: workEligibilityResult.loadError,
    workAuthDocumentsList: workAuthDocumentsResult.value
      ? buildHrComplianceWorkAuthDocumentsListSurface({
          window: workAuthDocumentsResult.value,
          searchValue: workAuthDocumentSearch,
          canWrite: input.canWrite,
          canViewSensitive: input.canViewSensitive,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceWorkAuthDocumentsSurfaceKey
            ],
          searchParam: hrComplianceWorkAuthDocumentSearchParam,
          searchLabel: copy.workAuthDocuments.searchLabel,
          searchPlaceholder: copy.workAuthDocuments.searchPlaceholder,
          surfaceHeaderTitle: copy.workAuthDocuments.surfaceHeaderTitle,
        }),
    workAuthDocumentsLoadError: workAuthDocumentsResult.loadError,
    regulatoryCalendarList: regulatoryCalendarResult.value
      ? buildHrComplianceRegulatoryCalendarListSurface({
          window: regulatoryCalendarResult.value,
          searchValue: regulatoryCalendarSearch,
          canViewSensitive: input.canViewSensitive,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceRegulatoryCalendarSurfaceKey
            ],
          searchParam: hrComplianceRegulatoryCalendarSearchParam,
          searchLabel: copy.regulatoryCalendar.searchLabel,
          searchPlaceholder: copy.regulatoryCalendar.searchPlaceholder,
          surfaceHeaderTitle: copy.regulatoryCalendar.surfaceHeaderTitle,
        }),
    regulatoryCalendarLoadError: regulatoryCalendarResult.loadError,
    regulatoryCalendarMergeTruncated:
      regulatoryCalendarResult.value?.mergeTruncated ?? false,
    alertsList: alertsResult.value
      ? buildHrComplianceAlertsListSurface({
          window: alertsResult.value,
          searchValue: alertsSearch,
          canViewSensitive: input.canViewSensitive,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[hrComplianceAlertsSurfaceKey],
          searchParam: hrComplianceAlertsSearchParam,
          searchLabel: copy.alerts.searchLabel,
          searchPlaceholder: copy.alerts.searchPlaceholder,
          surfaceHeaderTitle: copy.alerts.surfaceHeaderTitle,
        }),
    alertsLoadError: alertsResult.loadError,
    alertsMergeTruncated: alertsResult.value?.mergeTruncated ?? false,
    reviewQueueList: reviewQueueResult.value
      ? buildHrComplianceReviewQueueListSurface({
          window: reviewQueueResult.value,
          searchValue: reviewQueueSearch,
          canWrite: input.canWrite,
          canViewSensitive: input.canViewSensitive,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceReviewQueueSurfaceKey
            ],
          searchParam: hrComplianceReviewQueueSearchParam,
          searchLabel: copy.reviewQueue.searchLabel,
          searchPlaceholder: copy.reviewQueue.searchPlaceholder,
          surfaceHeaderTitle: copy.reviewQueue.surfaceHeaderTitle,
        }),
    reviewQueueLoadError: reviewQueueResult.loadError,
    reviewQueueMergeTruncated:
      reviewQueueResult.value?.mergeTruncated ?? false,
    evidenceLinksList: evidenceLinksResult.value
      ? buildHrComplianceEvidenceLinksListSurface({
          window: evidenceLinksResult.value,
          searchValue: evidenceLinksSearch,
          canWrite: input.canWrite,
          canViewSensitive: input.canViewSensitive,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceEvidenceLinksSurfaceKey
            ],
          searchParam: hrComplianceEvidenceLinksSearchParam,
          searchLabel: copy.evidenceLinks.searchLabel,
          searchPlaceholder: copy.evidenceLinks.searchPlaceholder,
          surfaceHeaderTitle: copy.evidenceLinks.surfaceHeaderTitle,
        }),
    evidenceLinksLoadError: evidenceLinksResult.loadError,
    auditTrailList: auditTrailResult.value
      ? buildHrComplianceAuditTrailListSurface({
          window: auditTrailResult.value,
          searchValue: auditTrailSearch,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId:
            HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[
              hrComplianceAuditTrailSurfaceKey
            ],
          searchParam: hrComplianceAuditTrailSearchParam,
          searchLabel: copy.auditTrail.searchLabel,
          searchPlaceholder: copy.auditTrail.searchPlaceholder,
          surfaceHeaderTitle: copy.auditTrail.surfaceHeaderTitle,
        }),
    auditTrailLoadError: auditTrailResult.loadError,
    overviewStatGroups: buildHrComplianceOverviewStatGroups({
      snapshot: overviewResult.value ?? emptyOverviewSnapshot,
    }),
    overviewBreakdownList: overviewResult.value
      ? buildHrComplianceOverviewBreakdownListSurface({
          snapshot: overviewResult.value,
        })
      : buildComplianceListLoadErrorPlaceholder({
          columnsId: hrComplianceOverviewBreakdownColumnsId,
          searchParam: "complianceOverviewBreakdownSearch",
          searchLabel: copy.overviewBreakdown.colDimension,
          searchPlaceholder: copy.overviewBreakdown.colDimensionValue,
          surfaceHeaderTitle: copy.overviewBreakdown.surfaceHeaderTitle,
          emptyTitle: copy.overviewBreakdown.emptyTitle,
          emptyDescription: copy.overviewBreakdown.emptyDescription,
        }),
    overviewLoadError: overviewResult.loadError,
  } satisfies {
    canWrite: boolean;
    canViewSensitive: boolean;
    departments: Array<{ id: string; name: string }>;
    employeePickerOptions: Array<{ value: string; label: string }>;
    documentPickerOptions: readonly HrComplianceDocumentPickerOption[];
    obligationsList: ReturnType<typeof buildHrComplianceObligationsListSurface>;
    obligationsLoadError?: EmptyState;
    filingsList: ReturnType<typeof buildHrComplianceFilingsListSurface>;
    filingsLoadError?: EmptyState;
    exceptionsList: ReturnType<typeof buildHrComplianceExceptionsListSurface>;
    exceptionsLoadError?: EmptyState;
    laborLawRequirementsList: ReturnType<
      typeof buildHrComplianceLaborLawRequirementsListSurface
    >;
    laborLawRequirementsLoadError?: EmptyState;
    statutoryRequirementsList: ReturnType<
      typeof buildHrComplianceStatutoryRequirementsListSurface
    >;
    statutoryRequirementsLoadError?: EmptyState;
    policyAcknowledgementsList: ReturnType<
      typeof buildHrCompliancePolicyAcknowledgementsListSurface
    >;
    policyAcknowledgementsLoadError?: EmptyState;
    safetyTrainingRequirementsList: ReturnType<
      typeof buildHrComplianceSafetyTrainingRequirementsListSurface
    >;
    safetyTrainingRequirementsLoadError?: EmptyState;
    workplaceSafetyRequirementsList: ReturnType<
      typeof buildHrComplianceWorkplaceSafetyRequirementsListSurface
    >;
    workplaceSafetyRequirementsLoadError?: EmptyState;
    workEligibilityList: ReturnType<typeof buildHrComplianceWorkEligibilityListSurface>;
    workEligibilityLoadError?: EmptyState;
    workAuthDocumentsList: ReturnType<typeof buildHrComplianceWorkAuthDocumentsListSurface>;
    workAuthDocumentsLoadError?: EmptyState;
    regulatoryCalendarList: ReturnType<
      typeof buildHrComplianceRegulatoryCalendarListSurface
    >;
    regulatoryCalendarLoadError?: EmptyState;
    regulatoryCalendarMergeTruncated: boolean;
    alertsList: ReturnType<typeof buildHrComplianceAlertsListSurface>;
    alertsLoadError?: EmptyState;
    alertsMergeTruncated: boolean;
    reviewQueueList: ReturnType<typeof buildHrComplianceReviewQueueListSurface>;
    reviewQueueLoadError?: EmptyState;
    reviewQueueMergeTruncated: boolean;
    evidenceLinksList: ReturnType<typeof buildHrComplianceEvidenceLinksListSurface>;
    evidenceLinksLoadError?: EmptyState;
    auditTrailList: ReturnType<typeof buildHrComplianceAuditTrailListSurface>;
    auditTrailLoadError?: EmptyState;
    overviewStatGroups: ReturnType<typeof buildHrComplianceOverviewStatGroups>;
    overviewBreakdownList: ReturnType<
      typeof buildHrComplianceOverviewBreakdownListSurface
    >;
    overviewLoadError?: EmptyState;
  };
}

export type HrCompliancePageModel = Awaited<
  ReturnType<typeof buildHrCompliancePageModel>
>;
