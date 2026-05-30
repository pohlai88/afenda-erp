import "@afenda/kernel/server";
import React from "react";
import { SectionPanel } from "@afenda/ui";

/**
 * Public server door for feature packages.
 * Re-export from actions/, data/, events/, policies/.
 */
export * from "./employee-management/compliance-regulatory-tracking/server";
export * from "./employee-management/documents-management/server";
export * from "./employee-management/employee-lifecycle-management/server";
export * from "./employee-management/offboarding-exit-management/server";
export * from "./employee-management/employee-records-management/server";
export * from "./employee-management/organizational-chart-hierarchy/server";
export * from "./time-attendance/leave-attendance-management/server";
export * from "./time-attendance/flexible-work-arrangement-tracking/server";
export * from "./payroll-compensation/benefits-administration/server";
export * from "./time-attendance/absence-analytics-trends/server";

export { requireHrRead } from "./policies/hr-module-access.policy.server";

import {
  buildHrAttendancePageModel,
  buildHrLamPageModel,
  buildHrLeavePageModel,
  HrAttendanceWorkbenchSection,
  HrLamWorkbenchSection,
  HrLeaveWorkbenchSection,
  HrLamAccessDeniedPanel,
  requireHrLamAttendanceRead,
  requireHrLamRead,
} from "./time-attendance/leave-attendance-management/server";

import {
  buildHrFwaPageModel,
  HrFwaWorkbenchSection,
  HrFwaAccessDeniedPanel,
  requireHrFwaRead,
} from "./time-attendance/flexible-work-arrangement-tracking/server";

export {
  buildHrLamPageModel,
  buildHrLeavePageModel,
  buildHrAttendancePageModel,
  HrLamWorkbenchSection,
  HrAttendanceWorkbenchSection,
  HrLeaveWorkbenchSection,
  requireHrLamAttendanceRead,
  requireHrLamRead,
  buildHrFwaPageModel,
  HrFwaWorkbenchSection,
  HrFwaAccessDeniedPanel,
  requireHrFwaRead,
};

export { HrLamAccessDeniedPanel as HrAttendanceAccessDeniedPanel };
export { HrLamAccessDeniedPanel as HrLeaveAccessDeniedPanel };

function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return React.createElement(
    SectionPanel as any,
    { headingLevel: 2, title, description },
    React.createElement(
      "p",
      { className: "type-muted" },
      "This area is now owned by ",
      React.createElement("strong", null, "HR Suite"),
      " and is being wired up.",
    ),
  );
}

export function HrAttendanceAccessDenied() {
  return React.createElement(HrLamAccessDeniedPanel);
}
export function HrLeaveAccessDenied() {
  return React.createElement(HrLamAccessDeniedPanel);
}
export function HrAttendanceSection({
  model,
}: {
  model: React.ComponentProps<typeof HrAttendanceWorkbenchSection>["model"];
}) {
  return React.createElement(HrAttendanceWorkbenchSection, { model });
}
export function HrLeaveSection({
  model,
}: {
  model: React.ComponentProps<typeof HrLeaveWorkbenchSection>["model"];
}) {
  return React.createElement(HrLeaveWorkbenchSection, { model });
}

export async function requireHrAttendanceRead() {
  return requireHrLamAttendanceRead();
}
export async function requireHrLeaveRead() {
  return requireHrLamRead();
}

function denied() {
  throw new Error("HR Suite not yet implemented.");
}

export function HrOnboardingAccessDenied() {
  return React.createElement(EmptyState, {
    title: "Access restricted",
    description: "Onboarding is not available.",
  });
}
export function HrOvertimeAccessDenied() {
  return React.createElement(EmptyState, {
    title: "Access restricted",
    description: "Overtime is not available.",
  });
}
export function HrShiftsAccessDenied() {
  return React.createElement(EmptyState, {
    title: "Access restricted",
    description: "Shifts are not available.",
  });
}

export function HrEmployeeCreateSection(_props: any) {
  return React.createElement(EmptyState, { title: "Add employee" });
}
export function HrEmployeeDetailSection(_props: any) {
  return React.createElement(EmptyState, { title: "Employee detail" });
}
export function HrOnboardingSection(_props: any) {
  return React.createElement(EmptyState, { title: "Onboarding" });
}
export function HrOrgChartSection(_props: any) {
  return React.createElement(EmptyState, { title: "Org chart" });
}
export function HrOvertimeSection(_props: any) {
  return React.createElement(EmptyState, { title: "Overtime" });
}
export function HrDepartmentsSection(_props: any) {
  return React.createElement(EmptyState, { title: "Departments" });
}
export function HrPositionsSection(_props: any) {
  return React.createElement(EmptyState, { title: "Positions" });
}
export function HrShiftsSection(_props: any) {
  return React.createElement(EmptyState, { title: "Shifts" });
}

export async function requireHrOnboardingRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}
export async function requireHrOvertimeRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}
export async function requireHrShiftsRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}

export async function buildHrOnboardingPageModel(_args: any) {
  denied();
  return { window: { rows: [] }, searchValue: "", checklistItems: [] };
}
export async function buildHrOvertimePageModel(_args: any) {
  denied();
  return { window: { rows: [] }, pendingWindow: { rows: [] }, searchValue: "" };
}
export async function buildHrShiftsPageModel(_args: any) {
  denied();
  return {
    assignmentWindow: { rows: [] },
    scheduledWindow: { rows: [] },
    cancellableWindow: { rows: [] },
    templateWindow: { rows: [] },
    searchValue: "",
  };
}

export async function loadHrOnboardingFormOptions(_organizationId?: string) {
  denied();
  return {
    employees: [] as Array<{ id: string; label: string }>,
    checklistItems: [] as any[],
  };
}
export async function loadHrEmployeeFormOptions(_args?: any) {
  denied();
  return {};
}
export async function listHrEmployeeLifecycleEvents(_args: any) {
  denied();
  return [] as any[];
}
