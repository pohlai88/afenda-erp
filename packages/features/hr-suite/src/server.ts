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

export { requireHrRead } from "./policies/hr-module-access.policy.server";

function denied() {
  throw new Error("HR Suite not yet implemented.");
}

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
  return React.createElement(EmptyState, {
    title: "Access restricted",
    description: "Attendance is not available.",
  });
}
export function HrLeaveAccessDenied() {
  return React.createElement(EmptyState, {
    title: "Access restricted",
    description: "Leave is not available.",
  });
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

export function HrAttendanceSection(_props: any) {
  return React.createElement(EmptyState, { title: "Attendance" });
}
export function HrEmployeeCreateSection(_props: any) {
  return React.createElement(EmptyState, { title: "Add employee" });
}
export function HrEmployeeDetailSection(_props: any) {
  return React.createElement(EmptyState, { title: "Employee detail" });
}
export function HrLeaveSection(_props: any) {
  return React.createElement(EmptyState, { title: "Leave" });
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

export async function requireHrAttendanceRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}
export async function requireHrLeaveRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
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

export async function buildHrAttendancePageModel(_args: any) {
  denied();
  return { window: { rows: [] }, searchValue: "" };
}
export async function buildHrLeavePageModel(_args: any) {
  denied();
  return { window: { rows: [] }, pendingWindow: { rows: [] }, searchValue: "" };
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
  return { employees: [] as Array<{ id: string; label: string }>, checklistItems: [] as any[] };
}
export async function loadHrEmployeeFormOptions(_args?: any) {
  denied();
  return {};
}
export async function listHrEmployeeLifecycleEvents(_args: any) {
  denied();
  return [] as any[];
}
