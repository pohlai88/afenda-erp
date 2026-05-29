import {
  ensureHrWorkAuthorizationDocuments,
  ensureHrWorkEligibilityTracking,
  listHrComplianceAlertsWindow,
  listHrComplianceExceptionsWindow,
  listHrComplianceFilingsWindow,
  listHrComplianceObligationsWindow,
  listHrComplianceRegulatoryCalendarWindow,
  listHrDepartments,
  listHrEmployeeLaborLawRequirementsWindow,
  listHrEmployeePolicyAcknowledgementsWindow,
  listHrEmployeeSafetyTrainingRequirementsWindow,
  listHrEmployeeWorkplaceSafetyRequirementsWindow,
  listHrWorkAuthorizationDocumentsWindow,
  listHrWorkEligibilityWindow,
  syncHrEmployeeLaborLawRequirements,
  syncHrEmployeePolicyAcknowledgements,
  syncHrComplianceFilings,
  syncHrEmployeeSafetyTrainingRequirements,
  syncHrEmployeeWorkplaceSafetyRequirements,
  syncHrComplianceExceptions,
} from "@afenda/db";
import type { EmptyState } from "@afenda/governed-surface/schemas";

import {
  buildComplianceListLoadErrorPlaceholder,
  settleComplianceListLoad,
} from "./hr.workforce.compliance-list-load.shared";
import { buildHrComplianceFilingsListSurface } from "../surface/hr.workforce.compliance-filings-list.surface";
import {
  hrComplianceFilingSearchParam,
} from "../surface/hr.workforce.compliance-filings-list.surface";
import { buildHrComplianceExceptionsListSurface } from "../surface/hr.workforce.compliance-exceptions-list.surface";
import {
  hrComplianceExceptionSearchParam,
} from "../surface/hr.workforce.compliance-exceptions-list.surface";
import { buildHrComplianceLaborLawRequirementsListSurface } from "../surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import {
  hrComplianceLaborLawSearchParam,
} from "../surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import { buildHrComplianceObligationsListSurface } from "../surface/hr.workforce.compliance-obligations-list.surface";
import {
  hrComplianceObligationSearchParam,
} from "../surface/hr.workforce.compliance-obligations-list.surface";
import {
  buildHrComplianceSafetyTrainingRequirementsListSurface,
  hrComplianceSafetyTrainingSearchParam,
} from "../surface/hr.workforce.compliance-safety-training-requirements-list.surface";
import {
  buildHrComplianceWorkAuthDocumentsListSurface,
  hrComplianceWorkAuthDocumentSearchParam,
} from "../surface/hr.workforce.compliance-work-auth-documents-list.surface";
import {
  hrComplianceWorkEligibilitySearchParam,
} from "../surface/hr.workforce.compliance-work-eligibility-list.surface";
import {
  hrComplianceWorkplaceSafetySearchParam,
} from "../surface/hr.workforce.compliance-workplace-safety-list.surface";
import {
  buildHrCompliancePolicyAcknowledgementsListSurface,
  hrCompliancePolicyAcknowledgementSearchParam,
} from "../surface/hr.workforce.compliance-policy-acknowledgements-list.surface";
import { buildHrComplianceWorkEligibilityListSurface } from "../surface/hr.workforce.compliance-work-eligibility-list.surface";
import { buildHrComplianceWorkplaceSafetyRequirementsListSurface } from "../surface/hr.workforce.compliance-workplace-safety-list.surface";
import {
  buildHrComplianceRegulatoryCalendarListSurface,
  hrComplianceRegulatoryCalendarSearchParam,
} from "../surface/hr.workforce.compliance-regulatory-calendar-list.surface";
import {
  buildHrComplianceAlertsListSurface,
  hrComplianceAlertsSearchParam,
} from "../surface/hr.workforce.compliance-alerts-list.surface";
import {
  HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY,
  hrComplianceAlertsSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
} from "../surface/hr.workforce.compliance-surface-metadata.shared";
import { hrComplianceUiCopy } from "../surface/hr.workforce.compliance-ui.copy.shared";

export type HrCompliancePageModelInput = {
  organizationId: string;
  canWrite: boolean;
  /** Applies to all lists when specific search params are omitted. */
  search?: string;
  obligationSearch?: string;
  exceptionSearch?: string;
  laborLawSearch?: string;
  policyAcknowledgementSearch?: string;
  safetyTrainingSearch?: string;
  workplaceSafetySearch?: string;
  workEligibilitySearch?: string;
  workAuthDocumentSearch?: string;
  filingSearch?: string;
  regulatoryCalendarSearch?: string;
  alertsSearch?: string;
  obligationLimit?: number;
  exceptionLimit?: number;
  laborLawLimit?: number;
  policyAcknowledgementLimit?: number;
  safetyTrainingLimit?: number;
  workplaceSafetyLimit?: number;
  workEligibilityLimit?: number;
  workAuthDocumentLimit?: number;
  filingLimit?: number;
  regulatoryCalendarLimit?: number;
  alertsLimit?: number;
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

/** Runs source sync first, then exception auto-sync so gap detection reads fresh rows. */
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
  };
}

export async function buildHrCompliancePageModel(input: HrCompliancePageModelInput) {
  const obligationSearch = input.obligationSearch ?? input.search;
  const exceptionSearch = input.exceptionSearch ?? input.search;
  const laborLawSearch = input.laborLawSearch ?? input.search;
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
  const copy = hrComplianceUiCopy;

  await runHrCompliancePageLoadSync({ organizationId: input.organizationId });

  const [
    obligationsResult,
    filingsResult,
    exceptionsResult,
    laborLawResult,
    policyAcknowledgementResult,
    safetyTrainingResult,
    workplaceSafetyResult,
    workEligibilityResult,
    workAuthDocumentsResult,
    regulatoryCalendarResult,
    alertsResult,
    departments,
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
    loadComplianceDepartmentOptions(input.organizationId),
  ]);

  return {
    canWrite: input.canWrite,
    departments,
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
  } satisfies {
    canWrite: boolean;
    departments: Array<{ id: string; name: string }>;
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
  };
}

export type HrCompliancePageModel = Awaited<
  ReturnType<typeof buildHrCompliancePageModel>
>;
