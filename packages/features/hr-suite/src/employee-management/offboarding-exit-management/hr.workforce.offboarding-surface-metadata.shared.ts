import {
  hrOffboardingApprovalsSearchParam,
  hrOffboardingApprovalsSurfaceKey,
} from "./hr.workforce.offboarding-approvals-list.surface";
import {
  hrOffboardingAssetsSearchParam,
  hrOffboardingAssetsSurfaceKey,
} from "./hr.workforce.offboarding-assets-list.surface";
import {
  hrOffboardingAuditTrailSearchParam,
  hrOffboardingAuditTrailSurfaceKey,
} from "./hr.workforce.offboarding-audit-trail-list.surface";
import {
  hrOffboardingCasesSearchParam,
  hrOffboardingCasesSurfaceKey,
} from "./hr.workforce.offboarding-cases-list.surface";
import {
  hrOffboardingClearanceSearchParam,
  hrOffboardingClearanceSurfaceKey,
} from "./hr.workforce.offboarding-clearance-list.surface";
import {
  hrOffboardingOverdueSearchParam,
  hrOffboardingOverdueSurfaceKey,
} from "./hr.workforce.offboarding-overdue-list.surface";
import {
  hrOffboardingSettlementSearchParam,
  hrOffboardingSettlementSurfaceKey,
} from "./hr.workforce.offboarding-settlement-list.surface";
import {
  hrOffboardingApprovalsColumnsId,
  hrOffboardingAssetsColumnsId,
  hrOffboardingAuditTrailColumnsId,
  hrOffboardingCasesColumnsId,
  hrOffboardingClearanceColumnsId,
  hrOffboardingOverdueColumnsId,
  hrOffboardingSettlementColumnsId,
} from "./hr.workforce.offboarding-surface-columns.shared";

export {
  hrOffboardingApprovalsSurfaceKey,
  hrOffboardingApprovalsSearchParam,
  hrOffboardingAssetsSurfaceKey,
  hrOffboardingAssetsSearchParam,
  hrOffboardingAuditTrailSurfaceKey,
  hrOffboardingAuditTrailSearchParam,
  hrOffboardingCasesSurfaceKey,
  hrOffboardingCasesSearchParam,
  hrOffboardingClearanceSurfaceKey,
  hrOffboardingClearanceSearchParam,
  hrOffboardingOverdueSurfaceKey,
  hrOffboardingOverdueSearchParam,
  hrOffboardingSettlementSurfaceKey,
  hrOffboardingSettlementSearchParam,
};

export const HR_OFFBOARDING_LIST_SURFACE_KEYS = [
  hrOffboardingCasesSurfaceKey,
  hrOffboardingClearanceSurfaceKey,
  hrOffboardingApprovalsSurfaceKey,
  hrOffboardingAssetsSurfaceKey,
  hrOffboardingSettlementSurfaceKey,
  hrOffboardingOverdueSurfaceKey,
  hrOffboardingAuditTrailSurfaceKey,
] as const;

export type HrOffboardingListSurfaceKey =
  (typeof HR_OFFBOARDING_LIST_SURFACE_KEYS)[number];

export function getHrOffboardingListSurfaceKeys(): readonly HrOffboardingListSurfaceKey[] {
  return HR_OFFBOARDING_LIST_SURFACE_KEYS;
}

export const HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrOffboardingCasesSurfaceKey]: hrOffboardingCasesColumnsId,
  [hrOffboardingClearanceSurfaceKey]: hrOffboardingClearanceColumnsId,
  [hrOffboardingApprovalsSurfaceKey]: hrOffboardingApprovalsColumnsId,
  [hrOffboardingAssetsSurfaceKey]: hrOffboardingAssetsColumnsId,
  [hrOffboardingSettlementSurfaceKey]: hrOffboardingSettlementColumnsId,
  [hrOffboardingOverdueSurfaceKey]: hrOffboardingOverdueColumnsId,
  [hrOffboardingAuditTrailSurfaceKey]: hrOffboardingAuditTrailColumnsId,
} as const;

export const HR_OFFBOARDING_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrOffboardingCasesSurfaceKey]: hrOffboardingCasesSearchParam,
  [hrOffboardingClearanceSurfaceKey]: hrOffboardingClearanceSearchParam,
  [hrOffboardingApprovalsSurfaceKey]: hrOffboardingApprovalsSearchParam,
  [hrOffboardingAssetsSurfaceKey]: hrOffboardingAssetsSearchParam,
  [hrOffboardingSettlementSurfaceKey]: hrOffboardingSettlementSearchParam,
  [hrOffboardingOverdueSurfaceKey]: hrOffboardingOverdueSearchParam,
  [hrOffboardingAuditTrailSurfaceKey]: hrOffboardingAuditTrailSearchParam,
} as const;

export const hrOffboardingExitTypeFilterParam = "offboardingExitTypeFilter";

export const HR_OFFBOARDING_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrOffboardingCasesSearchParam]: "casesSearch",
  [hrOffboardingClearanceSearchParam]: "clearanceSearch",
  [hrOffboardingApprovalsSearchParam]: "approvalsSearch",
  [hrOffboardingAssetsSearchParam]: "assetsSearch",
  [hrOffboardingSettlementSearchParam]: "settlementSearch",
  [hrOffboardingOverdueSearchParam]: "overdueSearch",
  [hrOffboardingAuditTrailSearchParam]: "auditTrailSearch",
  [hrOffboardingExitTypeFilterParam]: "exitTypeFilter",
} as const;

export const HR_OFFBOARDING_WORKBENCH_READ_ONLY_SURFACE_KEYS = new Set<
  HrOffboardingListSurfaceKey
>([
  hrOffboardingOverdueSurfaceKey,
  hrOffboardingAuditTrailSurfaceKey,
  hrOffboardingSettlementSurfaceKey,
]);
