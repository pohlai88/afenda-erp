import { describe, expect, it } from "vitest";

import { hrWorkforceLifecycleReadPermission } from "../../src/employee-management/employee-lifecycle-management/contracts/hr.workforce.lifecycle.contract";
import { buildHrLifecycleAuditTrailListSurface } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-audit-trail-list.surface";
import { buildHrLifecycleNoticePeriodListSurface } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-notice-period-list.surface";
import { buildHrLifecycleOffboardingCasesListSurface } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-offboarding-cases-list.surface";
import { buildHrLifecycleOnboardingCasesListSurface } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-onboarding-cases-list.surface";
import { buildHrLifecycleOverviewListSurface } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-overview-list.surface";
import { buildHrLifecyclePendingTransitionsListSurface } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-pending-transitions-list.surface";
import { buildHrLifecycleProbationDueListSurface } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-probation-due-list.surface";
import {
  hrLifecycleAuditTrailColumnsId,
  hrLifecycleNoticePeriodColumnsId,
  hrLifecycleOffboardingCasesColumnsId,
  hrLifecycleOnboardingCasesColumnsId,
  hrLifecycleOverviewColumnsId,
  hrLifecyclePendingTransitionsColumnsId,
  hrLifecycleProbationDueColumnsId,
} from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-surface-columns.shared";
import {
  hrLifecycleAuditTrailSurfaceKey,
  hrLifecycleNoticePeriodSurfaceKey,
  hrLifecycleOffboardingCasesSurfaceKey,
  hrLifecycleOnboardingCasesSurfaceKey,
  hrLifecycleOverviewSurfaceKey,
  hrLifecyclePendingTransitionsSurfaceKey,
  hrLifecycleProbationDueSurfaceKey,
} from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-surface-metadata.shared";

const emptyWindow = {
  rows: [],
  pageSize: 25,
  totalCount: 0,
  hasNextPage: false,
};

describe("lifecycle Pattern C governed list EUI contract", () => {
  const cases = [
    {
      label: "pending transitions",
      surfaceKey: hrLifecyclePendingTransitionsSurfaceKey,
      searchParam: "lifecyclePendingTransitionsSearch",
      columnsId: hrLifecyclePendingTransitionsColumnsId,
      build: () =>
        buildHrLifecyclePendingTransitionsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "probation due",
      surfaceKey: hrLifecycleProbationDueSurfaceKey,
      searchParam: "lifecycleProbationDueSearch",
      columnsId: hrLifecycleProbationDueColumnsId,
      build: () =>
        buildHrLifecycleProbationDueListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "onboarding cases",
      surfaceKey: hrLifecycleOnboardingCasesSurfaceKey,
      searchParam: "lifecycleOnboardingCasesSearch",
      columnsId: hrLifecycleOnboardingCasesColumnsId,
      build: () =>
        buildHrLifecycleOnboardingCasesListSurface({
          window: emptyWindow,
        }),
    },
    {
      label: "notice period",
      surfaceKey: hrLifecycleNoticePeriodSurfaceKey,
      searchParam: "lifecycleNoticePeriodSearch",
      columnsId: hrLifecycleNoticePeriodColumnsId,
      build: () =>
        buildHrLifecycleNoticePeriodListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "offboarding cases",
      surfaceKey: hrLifecycleOffboardingCasesSurfaceKey,
      searchParam: "lifecycleOffboardingCasesSearch",
      columnsId: hrLifecycleOffboardingCasesColumnsId,
      build: () =>
        buildHrLifecycleOffboardingCasesListSurface({
          window: emptyWindow,
        }),
    },
    {
      label: "overview roster",
      surfaceKey: hrLifecycleOverviewSurfaceKey,
      searchParam: "lifecycleOverviewSearch",
      columnsId: hrLifecycleOverviewColumnsId,
      build: () =>
        buildHrLifecycleOverviewListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "audit trail",
      surfaceKey: hrLifecycleAuditTrailSurfaceKey,
      searchParam: "lifecycleAuditTrailSearch",
      columnsId: hrLifecycleAuditTrailColumnsId,
      primaryColumnId: "effectiveDate",
      build: () =>
        buildHrLifecycleAuditTrailListSurface({
          window: emptyWindow,
        }),
    },
  ] as const;

  it.each(cases)(
    "$label surface satisfies governed list metadata contract",
    (testCase) => {
      const { searchParam, columnsId, build } = testCase;
      const primaryColumnId =
        "primaryColumnId" in testCase ? testCase.primaryColumnId : "employee";
      const configuration = build();

      expect(configuration.dataNature).toBe("table");
      expect(configuration.presentation?.tableDensity).toBe("compact");
      expect(configuration.presentation?.stickyHeader).toBe(true);
      expect(configuration.requiresErpPermission).toEqual(
        hrWorkforceLifecycleReadPermission,
      );
      expect(configuration.surface?.rowKey).toBe("id");
      expect(configuration.surface?.columnsId).toBe(columnsId);
      expect(configuration.presentation?.toolbar?.search?.param).toBe(
        searchParam,
      );
      expect(configuration.surface?.header?.title).toBeTruthy();
      expect(configuration.surface?.empty?.title).toBeTruthy();
      expect(configuration.presentation?.primaryColumnId).toBe(
        primaryColumnId,
      );
    },
  );
});
