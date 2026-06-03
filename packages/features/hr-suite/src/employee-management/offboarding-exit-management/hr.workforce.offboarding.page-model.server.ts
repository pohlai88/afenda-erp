import {
  listHrEmployeeDirectoryWindow,
  listHrOffboardingApprovalStepsWindow,
  listHrOffboardingAssetsWindow,
  listHrOffboardingAuditEventsWindow,
  listHrOffboardingCasesWindow,
  listHrOffboardingClearanceWindow,
  listHrOffboardingSettlementWindow,
  type HrOffboardingExitType,
} from "@afenda/db";

import {
  buildOffboardingListLoadErrorPlaceholder,
  settleOffboardingListLoad,
} from "./hr.workforce.offboarding-list-load.shared";
import { loadHrOffboardingOverview } from "./hr.workforce.offboarding-overview.shared";
import { hrOffboardingExitTypeSchema } from "./hr.workforce.offboarding-exit-type.schema";
import { buildHrOffboardingApprovalsListSurface } from "./hr.workforce.offboarding-approvals-list.surface";
import { hrOffboardingApprovalsSearchParam } from "./hr.workforce.offboarding-approvals-list.surface";
import { hrOffboardingApprovalsSurfaceKey } from "./hr.workforce.offboarding-approvals-list.surface";
import { buildHrOffboardingAssetsListSurface } from "./hr.workforce.offboarding-assets-list.surface";
import { hrOffboardingAssetsSearchParam } from "./hr.workforce.offboarding-assets-list.surface";
import { hrOffboardingAssetsSurfaceKey } from "./hr.workforce.offboarding-assets-list.surface";
import { buildHrOffboardingAuditTrailListSurface } from "./hr.workforce.offboarding-audit-trail-list.surface";
import { hrOffboardingAuditTrailSearchParam } from "./hr.workforce.offboarding-audit-trail-list.surface";
import { hrOffboardingAuditTrailSurfaceKey } from "./hr.workforce.offboarding-audit-trail-list.surface";
import { buildHrOffboardingCasesListSurface } from "./hr.workforce.offboarding-cases-list.surface";
import { hrOffboardingCasesSearchParam } from "./hr.workforce.offboarding-cases-list.surface";
import { hrOffboardingCasesSurfaceKey } from "./hr.workforce.offboarding-cases-list.surface";
import { buildHrOffboardingClearanceListSurface } from "./hr.workforce.offboarding-clearance-list.surface";
import { hrOffboardingClearanceSearchParam } from "./hr.workforce.offboarding-clearance-list.surface";
import { hrOffboardingClearanceSurfaceKey } from "./hr.workforce.offboarding-clearance-list.surface";
import { buildHrOffboardingOverdueListSurface } from "./hr.workforce.offboarding-overdue-list.surface";
import { hrOffboardingOverdueSearchParam } from "./hr.workforce.offboarding-overdue-list.surface";
import { hrOffboardingOverdueSurfaceKey } from "./hr.workforce.offboarding-overdue-list.surface";
import { buildHrOffboardingOverviewStatGroups } from "./hr.workforce.offboarding-overview-stat.surface";
import { buildHrOffboardingSettlementListSurface } from "./hr.workforce.offboarding-settlement-list.surface";
import { hrOffboardingSettlementSearchParam } from "./hr.workforce.offboarding-settlement-list.surface";
import { hrOffboardingSettlementSurfaceKey } from "./hr.workforce.offboarding-settlement-list.surface";
import { HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY } from "./hr.workforce.offboarding-surface-metadata.shared";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

export type HrOffboardingPageModelInput = {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  casesSearch?: string;
  clearanceSearch?: string;
  approvalsSearch?: string;
  assetsSearch?: string;
  settlementSearch?: string;
  overdueSearch?: string;
  auditTrailSearch?: string;
  exitTypeFilter?: string;
};

const OFFBOARDING_EMPLOYEE_PICKER_LIMIT = 200;
const OFFBOARDING_DEFAULT_PAGE_SIZE = 25;

function resolveExitTypeFilter(
  raw: string | undefined,
): HrOffboardingExitType | undefined {
  if (!raw) return undefined;
  const parsed = hrOffboardingExitTypeSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

async function loadOffboardingEmployeePickerOptions(organizationId: string) {
  try {
    const directory = await listHrEmployeeDirectoryWindow({
      organizationId,
      limit: OFFBOARDING_EMPLOYEE_PICKER_LIMIT,
    });
    return directory.rows
      .filter(
        (employee) =>
          employee.employmentStatus !== "archived" &&
          employee.employmentStatus !== "separated",
      )
      .map((employee) => ({
        value: employee.id,
        label: `${employee.displayName} (${employee.employeeNumber})`,
      }));
  } catch {
    return [] as Array<{ value: string; label: string }>;
  }
}

export async function buildHrOffboardingPageModel(
  input: HrOffboardingPageModelInput,
) {
  const exitType = resolveExitTypeFilter(input.exitTypeFilter);
  const casesCopy = hrOffboardingUiCopy.cases;
  const clearanceCopy = hrOffboardingUiCopy.clearance;
  const approvalsCopy = hrOffboardingUiCopy.approvals;
  const assetsCopy = hrOffboardingUiCopy.assets;
  const settlementCopy = hrOffboardingUiCopy.settlement;
  const overdueCopy = hrOffboardingUiCopy.overdue;
  const auditCopy = hrOffboardingUiCopy.auditTrail;

  const [
    snapshot,
    employeeOptions,
    casesLoad,
    clearanceLoad,
    approvalsLoad,
    assetsLoad,
    settlementLoad,
    overdueLoad,
    auditLoad,
  ] = await Promise.all([
    loadHrOffboardingOverview({ organizationId: input.organizationId }),
    loadOffboardingEmployeePickerOptions(input.organizationId),
    settleOffboardingListLoad({
      sectionTitle: casesCopy.sectionTitle,
      load: () =>
        listHrOffboardingCasesWindow({
          organizationId: input.organizationId,
          status: "in_progress",
          exitType,
          search: input.casesSearch,
          canViewSensitive: input.canViewSensitive,
          limit: OFFBOARDING_DEFAULT_PAGE_SIZE,
          offset: 0,
        }),
    }),
    settleOffboardingListLoad({
      sectionTitle: clearanceCopy.sectionTitle,
      load: () =>
        listHrOffboardingClearanceWindow({
          organizationId: input.organizationId,
          search: input.clearanceSearch,
          limit: OFFBOARDING_DEFAULT_PAGE_SIZE,
          offset: 0,
        }),
    }),
    settleOffboardingListLoad({
      sectionTitle: approvalsCopy.sectionTitle,
      load: () =>
        listHrOffboardingApprovalStepsWindow({
          organizationId: input.organizationId,
          search: input.approvalsSearch,
          pendingOnly: true,
          limit: OFFBOARDING_DEFAULT_PAGE_SIZE,
          offset: 0,
        }),
    }),
    settleOffboardingListLoad({
      sectionTitle: assetsCopy.sectionTitle,
      load: () =>
        listHrOffboardingAssetsWindow({
          organizationId: input.organizationId,
          search: input.assetsSearch,
          limit: OFFBOARDING_DEFAULT_PAGE_SIZE,
          offset: 0,
        }),
    }),
    settleOffboardingListLoad({
      sectionTitle: settlementCopy.sectionTitle,
      load: () =>
        listHrOffboardingSettlementWindow({
          organizationId: input.organizationId,
          search: input.settlementSearch,
          limit: OFFBOARDING_DEFAULT_PAGE_SIZE,
          offset: 0,
        }),
    }),
    settleOffboardingListLoad({
      sectionTitle: overdueCopy.sectionTitle,
      load: () =>
        listHrOffboardingClearanceWindow({
          organizationId: input.organizationId,
          search: input.overdueSearch,
          overdueOnly: true,
          limit: OFFBOARDING_DEFAULT_PAGE_SIZE,
          offset: 0,
        }),
    }),
    settleOffboardingListLoad({
      sectionTitle: auditCopy.sectionTitle,
      load: () =>
        listHrOffboardingAuditEventsWindow({
          organizationId: input.organizationId,
          search: input.auditTrailSearch,
          limit: OFFBOARDING_DEFAULT_PAGE_SIZE,
          offset: 0,
        }),
    }),
  ]);

  const casesList = casesLoad.ok
    ? buildHrOffboardingCasesListSurface({
        window: casesLoad.value,
        searchValue: input.casesSearch,
      })
    : buildOffboardingListLoadErrorPlaceholder({
        columnsId:
          HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY[
            hrOffboardingCasesSurfaceKey
          ],
        searchParam: hrOffboardingCasesSearchParam,
        searchLabel: casesCopy.searchLabel,
        searchPlaceholder: casesCopy.searchPlaceholder,
        surfaceHeaderTitle: casesCopy.surfaceHeaderTitle,
        emptyTitle: casesCopy.emptyTitle,
        emptyDescription: casesCopy.emptyDescription,
      });

  const clearanceList = clearanceLoad.ok
    ? buildHrOffboardingClearanceListSurface({
        window: clearanceLoad.value,
        searchValue: input.clearanceSearch,
        canWrite: input.canWrite,
      })
    : buildOffboardingListLoadErrorPlaceholder({
        columnsId:
          HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY[
            hrOffboardingClearanceSurfaceKey
          ],
        searchParam: hrOffboardingClearanceSearchParam,
        searchLabel: clearanceCopy.searchLabel,
        searchPlaceholder: clearanceCopy.searchPlaceholder,
        surfaceHeaderTitle: clearanceCopy.surfaceHeaderTitle,
        emptyTitle: clearanceCopy.emptyTitle,
        emptyDescription: clearanceCopy.emptyDescription,
      });

  const approvalsList = approvalsLoad.ok
    ? buildHrOffboardingApprovalsListSurface({
        window: approvalsLoad.value,
        searchValue: input.approvalsSearch,
      })
    : buildOffboardingListLoadErrorPlaceholder({
        columnsId:
          HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY[
            hrOffboardingApprovalsSurfaceKey
          ],
        searchParam: hrOffboardingApprovalsSearchParam,
        searchLabel: approvalsCopy.searchLabel,
        searchPlaceholder: approvalsCopy.searchPlaceholder,
        surfaceHeaderTitle: approvalsCopy.surfaceHeaderTitle,
        emptyTitle: approvalsCopy.emptyTitle,
        emptyDescription: approvalsCopy.emptyDescription,
      });

  const assetsList = assetsLoad.ok
    ? buildHrOffboardingAssetsListSurface({
        window: assetsLoad.value,
        searchValue: input.assetsSearch,
      })
    : buildOffboardingListLoadErrorPlaceholder({
        columnsId:
          HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY[
            hrOffboardingAssetsSurfaceKey
          ],
        searchParam: hrOffboardingAssetsSearchParam,
        searchLabel: assetsCopy.searchLabel,
        searchPlaceholder: assetsCopy.searchPlaceholder,
        surfaceHeaderTitle: assetsCopy.surfaceHeaderTitle,
        emptyTitle: assetsCopy.emptyTitle,
        emptyDescription: assetsCopy.emptyDescription,
      });

  const settlementList = settlementLoad.ok
    ? buildHrOffboardingSettlementListSurface({
        window: settlementLoad.value,
        searchValue: input.settlementSearch,
      })
    : buildOffboardingListLoadErrorPlaceholder({
        columnsId:
          HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY[
            hrOffboardingSettlementSurfaceKey
          ],
        searchParam: hrOffboardingSettlementSearchParam,
        searchLabel: settlementCopy.searchLabel,
        searchPlaceholder: settlementCopy.searchPlaceholder,
        surfaceHeaderTitle: settlementCopy.surfaceHeaderTitle,
        emptyTitle: settlementCopy.emptyTitle,
        emptyDescription: settlementCopy.emptyDescription,
      });

  const overdueList = overdueLoad.ok
    ? buildHrOffboardingOverdueListSurface({
        window: overdueLoad.value,
        searchValue: input.overdueSearch,
      })
    : buildOffboardingListLoadErrorPlaceholder({
        columnsId:
          HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY[
            hrOffboardingOverdueSurfaceKey
          ],
        searchParam: hrOffboardingOverdueSearchParam,
        searchLabel: overdueCopy.searchLabel,
        searchPlaceholder: overdueCopy.searchPlaceholder,
        surfaceHeaderTitle: overdueCopy.surfaceHeaderTitle,
        emptyTitle: overdueCopy.emptyTitle,
        emptyDescription: overdueCopy.emptyDescription,
      });

  const auditTrailList = auditLoad.ok
    ? buildHrOffboardingAuditTrailListSurface({
        window: auditLoad.value,
        searchValue: input.auditTrailSearch,
      })
    : buildOffboardingListLoadErrorPlaceholder({
        columnsId:
          HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY[
            hrOffboardingAuditTrailSurfaceKey
          ],
        searchParam: hrOffboardingAuditTrailSearchParam,
        searchLabel: auditCopy.searchLabel,
        searchPlaceholder: auditCopy.searchPlaceholder,
        surfaceHeaderTitle: auditCopy.surfaceHeaderTitle,
        emptyTitle: auditCopy.emptyTitle,
        emptyDescription: auditCopy.emptyDescription,
      });

  return {
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    copy: hrOffboardingUiCopy,
    employeeOptions,
    overviewStatGroups: buildHrOffboardingOverviewStatGroups({ snapshot }),
    casesList,
    casesLoadError: casesLoad.ok ? undefined : casesLoad.error,
    clearanceList,
    clearanceLoadError: clearanceLoad.ok ? undefined : clearanceLoad.error,
    approvalsList,
    approvalsLoadError: approvalsLoad.ok ? undefined : approvalsLoad.error,
    assetsList,
    assetsLoadError: assetsLoad.ok ? undefined : assetsLoad.error,
    settlementList,
    settlementLoadError: settlementLoad.ok ? undefined : settlementLoad.error,
    overdueList,
    overdueLoadError: overdueLoad.ok ? undefined : overdueLoad.error,
    auditTrailList,
    auditTrailLoadError: auditLoad.ok ? undefined : auditLoad.error,
  };
}

export type HrOffboardingPageModel = Awaited<
  ReturnType<typeof buildHrOffboardingPageModel>
>;
