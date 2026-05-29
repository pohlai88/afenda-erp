import "@afenda/kernel/server";
import React from "react";
import { SectionPanel } from "@afenda/ui";

/**
 * Public server door for feature packages.
 * Re-export from actions/, data/, events/, policies/.
 */
export * from "./metadata";

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
  return (
    <SectionPanel headingLevel={2} title={title} description={description}>
      <p className="type-muted">
        This area is now owned by <strong>HR Suite</strong> and is being wired up.
      </p>
    </SectionPanel>
  );
}

export function HrAttendanceAccessDenied() {
  return <EmptyState title="Access restricted" description="Attendance is not available." />;
}
export function HrComplianceAccessDenied() {
  return <EmptyState title="Access restricted" description="Compliance is not available." />;
}
export function HrDocumentsAccessDenied() {
  return <EmptyState title="Access restricted" description="Documents are not available." />;
}
export function HrEmployeesAccessDenied() {
  return <EmptyState title="Access restricted" description="Employees are not available." />;
}
export function HrLifecycleAccessDenied() {
  return <EmptyState title="Access restricted" description="Lifecycle is not available." />;
}
export function HrLeaveAccessDenied() {
  return <EmptyState title="Access restricted" description="Leave is not available." />;
}
export function HrOffboardingAccessDenied() {
  return <EmptyState title="Access restricted" description="Offboarding is not available." />;
}
export function HrOnboardingAccessDenied() {
  return <EmptyState title="Access restricted" description="Onboarding is not available." />;
}
export function HrOvertimeAccessDenied() {
  return <EmptyState title="Access restricted" description="Overtime is not available." />;
}
export function HrShiftsAccessDenied() {
  return <EmptyState title="Access restricted" description="Shifts are not available." />;
}

export function HrAttendanceSection(_props: any) {
  return <EmptyState title="Attendance" />;
}
export function HrComplianceSection(_props: any) {
  return <EmptyState title="Compliance" />;
}
export function HrDocumentsSection(_props: any) {
  return <EmptyState title="Documents" />;
}
export function HrEmployeesSection(_props: any) {
  return <EmptyState title="Employees" />;
}
export function HrEmployeeCreateSection(_props: any) {
  return <EmptyState title="Add employee" />;
}
export function HrEmployeeDetailSection(_props: any) {
  return <EmptyState title="Employee detail" />;
}
export function HrLifecycleSection(_props: any) {
  return <EmptyState title="Lifecycle" />;
}
export function HrLeaveSection(_props: any) {
  return <EmptyState title="Leave" />;
}
export function HrOffboardingSection(_props: any) {
  return <EmptyState title="Offboarding" />;
}
export function HrOnboardingSection(_props: any) {
  return <EmptyState title="Onboarding" />;
}
export function HrOrgChartSection(_props: any) {
  return <EmptyState title="Org chart" />;
}
export function HrOvertimeSection(_props: any) {
  return <EmptyState title="Overtime" />;
}
export function HrDepartmentsSection(_props: any) {
  return <EmptyState title="Departments" />;
}
export function HrPositionsSection(_props: any) {
  return <EmptyState title="Positions" />;
}
export function HrShiftsSection(_props: any) {
  return <EmptyState title="Shifts" />;
}

export async function requireHrEmployeesRead() {
  denied();
  return { organization: { id: "" }, canWrite: false, canViewLifecycle: false };
}
export async function requireHrEmployeesWrite() {
  denied();
}
export async function requireHrAttendanceRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}
export async function requireHrComplianceRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}
export async function requireHrDocumentsRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}
export async function requireHrLifecycleRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}
export async function requireHrLeaveRead() {
  denied();
  return { organization: { id: "" }, canWrite: false };
}
export async function requireHrOffboardingRead() {
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

export async function buildHrEmployeesPageModel(_args: any) {
  denied();
  return { window: { rows: [] }, searchValue: "" };
}
export async function buildHrAttendancePageModel(_args: any) {
  denied();
  return { window: { rows: [] }, searchValue: "" };
}
export async function buildHrCompliancePageModel(_args: any) {
  denied();
  return {
    obligationsWindow: { rows: [] },
    exceptionsWindow: { rows: [] },
    obligationsSearch: "",
    exceptionsSearch: "",
  };
}
export async function buildHrDocumentsPageModel(_args: any) {
  denied();
  return { window: { rows: [] }, searchValue: "", requirements: [] };
}
export async function buildHrLifecyclePageModel(_args: any) {
  denied();
  return { window: { rows: [] }, searchValue: "" };
}
export async function buildHrLeavePageModel(_args: any) {
  denied();
  return { window: { rows: [] }, pendingWindow: { rows: [] }, searchValue: "" };
}
export async function buildHrOffboardingPageModel(_args: any) {
  denied();
  return { window: { rows: [] }, searchValue: "", clearanceItems: [] };
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

export async function listHrEmployeeDirectory(_args: any) {
  denied();
  return { rows: [] as Array<{ id: string; employeeNumber: string; displayName: string }> };
}
export async function loadHrLifecycleFormOptions(_organizationId?: string) {
  denied();
  return { employees: [] as Array<{ id: string; label: string }>, formOptions: {} };
}
export async function loadHrOnboardingFormOptions(_organizationId?: string) {
  denied();
  return { employees: [] as Array<{ id: string; label: string }>, checklistItems: [] as any[] };
}
export async function loadHrEmployeeFormOptions(_args?: any) {
  denied();
  return {};
}
export async function getHrEmployeeDetail(_args: any) {
  denied();
  return null as any;
}
export async function listHrEmployeeLifecycleEvents(_args: any) {
  denied();
  return [] as any[];
}
