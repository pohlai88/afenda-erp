import {
  countHrLifecyclePendingTransitions,
  listHrLifecycleNoticePeriodWindow,
  listHrLifecycleOverviewWindow,
  listHrOffboardingCasesWindow,
  listHrOnboardingCasesWindow,
  type HrEmploymentStatus,
} from "@afenda/db";

export type HrLifecycleOverviewSnapshot = {
  activeRosterCount: number;
  probationCount: number;
  onboardingCount: number;
  pendingTransitionCount: number;
  noticePeriodCount: number;
  onboardingCasesCount: number;
  offboardingCasesCount: number;
};

async function countEmployeesByStatus(input: {
  organizationId: string;
  employmentStatus: HrEmploymentStatus;
}): Promise<number> {
  const window = await listHrLifecycleOverviewWindow({
    organizationId: input.organizationId,
    employmentStatus: input.employmentStatus,
    limit: 1,
    offset: 0,
  });
  return window.totalCount;
}

export async function loadHrLifecycleOverviewSnapshot(input: {
  organizationId: string;
}): Promise<HrLifecycleOverviewSnapshot> {
  const [
    activeRosterCount,
    probationCount,
    onboardingCount,
    pendingTransitionCount,
    noticePeriodCount,
    onboardingCasesCount,
    offboardingCasesCount,
  ] = await Promise.all([
      listHrLifecycleOverviewWindow({
        organizationId: input.organizationId,
        limit: 1,
        offset: 0,
      }).then((window) => window.totalCount),
      countEmployeesByStatus({
        organizationId: input.organizationId,
        employmentStatus: "probation",
      }),
      countEmployeesByStatus({
        organizationId: input.organizationId,
        employmentStatus: "onboarding",
      }),
      countHrLifecyclePendingTransitions({
        organizationId: input.organizationId,
      }),
      listHrLifecycleNoticePeriodWindow({
        organizationId: input.organizationId,
        limit: 1,
        offset: 0,
      }).then((window) => window.totalCount),
      listHrOnboardingCasesWindow({
        organizationId: input.organizationId,
        status: "in_progress",
        limit: 1,
        offset: 0,
      }).then((window) => window.totalCount),
      listHrOffboardingCasesWindow({
        organizationId: input.organizationId,
        status: "in_progress",
        limit: 1,
        offset: 0,
      }).then((window) => window.totalCount),
    ]);

  return {
    activeRosterCount,
    probationCount,
    onboardingCount,
    pendingTransitionCount,
    noticePeriodCount,
    onboardingCasesCount,
    offboardingCasesCount,
  };
}
