import {
  hrLifecycleAuditTrailSearchParam,
  hrLifecycleAuditTrailSurfaceKey,
} from "./hr.workforce.lifecycle-audit-trail-list.surface";
import {
  hrLifecycleEmploymentStatusFilterParam,
  hrLifecycleOverviewSearchParam,
  hrLifecycleOverviewSurfaceKey,
} from "./hr.workforce.lifecycle-overview-list.surface";
import {
  hrLifecycleNoticePeriodSearchParam,
  hrLifecycleNoticePeriodSurfaceKey,
} from "./hr.workforce.lifecycle-notice-period-list.surface";
import {
  hrLifecycleOffboardingCasesSearchParam,
  hrLifecycleOffboardingCasesSurfaceKey,
} from "./hr.workforce.lifecycle-offboarding-cases-list.surface";
import {
  hrLifecycleOnboardingCasesSearchParam,
  hrLifecycleOnboardingCasesSurfaceKey,
} from "./hr.workforce.lifecycle-onboarding-cases-list.surface";
import {
  hrLifecyclePendingTransitionsSearchParam,
  hrLifecyclePendingTransitionsSurfaceKey,
} from "./hr.workforce.lifecycle-pending-transitions-list.surface";
import {
  hrLifecycleProbationDueSearchParam,
  hrLifecycleProbationDueSurfaceKey,
} from "./hr.workforce.lifecycle-probation-due-list.surface";
import {
  hrLifecycleAuditTrailColumnsId,
  hrLifecycleNoticePeriodColumnsId,
  hrLifecycleOffboardingCasesColumnsId,
  hrLifecycleOnboardingCasesColumnsId,
  hrLifecycleOverviewColumnsId,
  hrLifecyclePendingTransitionsColumnsId,
  hrLifecycleProbationDueColumnsId,
} from "./hr.workforce.lifecycle-surface-columns.shared";

/** Canonical Pattern C list surface keys (ARCH-006 registry). */
export const HR_LIFECYCLE_LIST_SURFACE_KEYS = [
  hrLifecyclePendingTransitionsSurfaceKey,
  hrLifecycleProbationDueSurfaceKey,
  hrLifecycleOnboardingCasesSurfaceKey,
  hrLifecycleNoticePeriodSurfaceKey,
  hrLifecycleOffboardingCasesSurfaceKey,
  hrLifecycleOverviewSurfaceKey,
  hrLifecycleAuditTrailSurfaceKey,
] as const;

export type HrLifecycleListSurfaceKey =
  (typeof HR_LIFECYCLE_LIST_SURFACE_KEYS)[number];

export function getHrLifecycleListSurfaceKeys(): readonly HrLifecycleListSurfaceKey[] {
  return HR_LIFECYCLE_LIST_SURFACE_KEYS;
}

export const HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrLifecyclePendingTransitionsSurfaceKey]:
    hrLifecyclePendingTransitionsColumnsId,
  [hrLifecycleProbationDueSurfaceKey]: hrLifecycleProbationDueColumnsId,
  [hrLifecycleOnboardingCasesSurfaceKey]: hrLifecycleOnboardingCasesColumnsId,
  [hrLifecycleNoticePeriodSurfaceKey]: hrLifecycleNoticePeriodColumnsId,
  [hrLifecycleOffboardingCasesSurfaceKey]:
    hrLifecycleOffboardingCasesColumnsId,
  [hrLifecycleOverviewSurfaceKey]: hrLifecycleOverviewColumnsId,
  [hrLifecycleAuditTrailSurfaceKey]: hrLifecycleAuditTrailColumnsId,
} as const;

export const HR_LIFECYCLE_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrLifecyclePendingTransitionsSurfaceKey]:
    hrLifecyclePendingTransitionsSearchParam,
  [hrLifecycleProbationDueSurfaceKey]: hrLifecycleProbationDueSearchParam,
  [hrLifecycleOnboardingCasesSurfaceKey]: hrLifecycleOnboardingCasesSearchParam,
  [hrLifecycleNoticePeriodSurfaceKey]: hrLifecycleNoticePeriodSearchParam,
  [hrLifecycleOffboardingCasesSurfaceKey]:
    hrLifecycleOffboardingCasesSearchParam,
  [hrLifecycleOverviewSurfaceKey]: hrLifecycleOverviewSearchParam,
  [hrLifecycleAuditTrailSurfaceKey]: hrLifecycleAuditTrailSearchParam,
} as const;

export const HR_LIFECYCLE_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrLifecyclePendingTransitionsSearchParam]: "pendingTransitionsSearch",
  [hrLifecycleProbationDueSearchParam]: "probationDueSearch",
  [hrLifecycleOnboardingCasesSearchParam]: "onboardingCasesSearch",
  [hrLifecycleNoticePeriodSearchParam]: "noticePeriodSearch",
  [hrLifecycleOffboardingCasesSearchParam]: "offboardingCasesSearch",
  [hrLifecycleOverviewSearchParam]: "overviewSearch",
  [hrLifecycleAuditTrailSearchParam]: "auditTrailSearch",
  [hrLifecycleEmploymentStatusFilterParam]: "employmentStatusFilter",
} as const;

export const HR_LIFECYCLE_WORKBENCH_READ_ONLY_SURFACE_KEYS = new Set<
  HrLifecycleListSurfaceKey
>([
  hrLifecycleAuditTrailSurfaceKey,
  hrLifecycleOnboardingCasesSurfaceKey,
  hrLifecycleOffboardingCasesSurfaceKey,
]);
