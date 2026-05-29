import { createModuleFeatureMetadata } from "@afenda/kernel";

/**
 * Governed metadata door.
 * Runtime authority stays in server actions, queries, and policies.
 */
export const {
  moduleId,
  buildRecordListSurface,
  buildWorkItemListSurface,
  buildCountStatGrid,
  buildStatGrid,
  buildOverviewStatGrid,
  buildSavedViewsListSurface,
  buildDocumentRegistryListSurface,
  buildRecordDetailTabs,
  buildWorkItemDetailTabs,
  buildWorkItemKanbanSurface,
  getListSurfaceKeys,
  getOverviewStatSurfaceKey,
  getStatSurfaceKey,
  getWorkItemKanbanSurfaceKey,
} = createModuleFeatureMetadata("hr");

type HrUiCopyPage = { title: string; description: string; addEmployeeLabel?: string };

export const hrAttendanceUiCopy = {
  page: {
    title: "Attendance",
    description: "Attendance is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrComplianceUiCopy = {
  page: {
    title: "Compliance",
    description: "Compliance is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrDocumentsUiCopy = {
  page: {
    title: "Documents",
    description: "Documents are managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrEmployeesUiCopy = {
  page: {
    title: "Employees",
    description: "Employees are managed by HR Suite.",
    addEmployeeLabel: "Add employee",
  } satisfies HrUiCopyPage,
  create: {
    accessDeniedTitle: "Access restricted",
    accessDeniedDescription: "You don’t have permission to add employees.",
    backLabel: "Back to employees",
  },
  detail: {
    notFoundTitle: "Employee unavailable",
    notFoundDescription: "This employee record is not available.",
    backLabel: "Back to employees",
  },
};

export const hrLeaveUiCopy = {
  page: {
    title: "Leave",
    description: "Leave is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrLifecycleUiCopy = {
  page: {
    title: "Lifecycle",
    description: "Lifecycle is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrOffboardingUiCopy = {
  page: {
    title: "Offboarding",
    description: "Offboarding is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrOnboardingUiCopy = {
  page: {
    title: "Onboarding",
    description: "Onboarding is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrOvertimeUiCopy = {
  page: {
    title: "Overtime",
    description: "Overtime is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrShiftsUiCopy = {
  page: {
    title: "Shifts",
    description: "Shifts are managed by HR Suite.",
  } satisfies HrUiCopyPage,
};
