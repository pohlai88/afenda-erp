import type { AppCapability } from "@afenda/auth";

import { hrComplianceRoutePaths } from "../employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance-route.contract";
import { hrDocumentsRoutePaths } from "../employee-management/documents-management/contracts/hr.workforce.documents-route.contract";
import { hrLifecycleRoutePaths } from "../employee-management/employee-lifecycle-management/contracts/hr.workforce.lifecycle-route.contract";
import { hrOffboardingRoutePaths } from "../employee-management/offboarding-exit-management/contracts/hr.workforce.offboarding-route.contract";
import { hrOrgRoutePaths } from "../employee-management/organizational-chart-hierarchy/contracts/hr.workforce.org-route.contract";
import { hrBenefitsRoutePaths } from "../payroll-compensation/benefits-administration/contracts/hr.payroll.benefits-route.contract";
import { hrBonusRoutePaths } from "../payroll-compensation/bonus-incentive-management/contracts/hr.payroll.bonus-route.contract";
import { hrExpenseRoutePaths } from "../payroll-compensation/expenses-reimbursement/contracts/hr.payroll.expense-route.contract";
import { hrCpmRoutePaths } from "../payroll-compensation/compensation-planning-modeling/contracts/hr.payroll.cpm-route.contract";
import { hrCsfRoutePaths } from "../talent-management/competency-skills-framework/contracts/hr.talent.csf-route.contract";
import { hrPerformanceRoutePaths } from "../talent-management/performance-appraisals/contracts/hr.talent.performance-route.contract";
import { hrPayrollProcessingRoutePaths } from "../payroll-compensation/payroll-processing/contracts/hr.payroll.processing-route.contract";
import { hrAatRoutePaths } from "../time-attendance/absence-analytics-trends/contracts/hr.time.aat-route.contract";
import { hrRecordsRoutePaths } from "../employee-management/employee-records-management/contracts/hr.workforce.records-route.contract";
import { hrLamRoutePaths } from "../time-attendance/leave-attendance-management/contracts/hr.time.lam-route.contract";
import { hrFwaRoutePaths } from "../time-attendance/flexible-work-arrangement-tracking/contracts/hr.time.fwa-route.contract";
import { hrGeoRoutePaths } from "../time-attendance/geolocation-remote-checkin/contracts/hr.time.geo-route.contract";

type HrNavCapability = Extract<AppCapability, `hr.${string}`>;

export type HrModuleNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  requiredCapabilities: readonly HrNavCapability[];
};

export const hrModuleNavItems = [
  {
    href: hrComplianceRoutePaths.hub,
    label: "HR hub",
    exact: true,
    requiredCapabilities: ["hr.view"],
  },
  {
    href: hrComplianceRoutePaths.compliance,
    label: "Compliance",
    requiredCapabilities: ["hr.compliance.read", "hr.compliance.write"],
  },
  {
    href: hrLifecycleRoutePaths.lifecycle,
    label: "Lifecycle",
    requiredCapabilities: ["hr.lifecycle.read", "hr.lifecycle.write"],
  },
  {
    href: hrDocumentsRoutePaths.documents,
    label: "Documents",
    requiredCapabilities: ["hr.documents.read", "hr.documents.write"],
  },
  {
    href: hrOffboardingRoutePaths.offboarding,
    label: "Offboarding",
    requiredCapabilities: ["hr.offboarding.read", "hr.offboarding.write"],
  },
  {
    href: hrRecordsRoutePaths.records,
    label: "Records",
    requiredCapabilities: ["hr.employees.read", "hr.employees.write"],
  },
  {
    href: hrOrgRoutePaths.org,
    label: "Organization",
    requiredCapabilities: ["hr.org.read", "hr.org.write"],
  },
  {
    href: hrBenefitsRoutePaths.benefits,
    label: "Benefits",
    requiredCapabilities: ["hr.benefits.read", "hr.benefits.write"],
  },
  {
    href: hrBonusRoutePaths.bonus,
    label: "Bonus & Incentive",
    requiredCapabilities: ["hr.bonus.read", "hr.bonus.write"],
  },
  {
    href: hrExpenseRoutePaths.expenses,
    label: "Expenses",
    requiredCapabilities: ["hr.expense.read", "hr.expense.write"],
  },
  {
    href: hrCpmRoutePaths.compensationPlanning,
    label: "Compensation Planning",
    requiredCapabilities: ["hr.cpm.read", "hr.cpm.write", "hr.cpm.approve"],
  },
  {
    href: hrCsfRoutePaths.hub,
    label: "Competency & Skills",
    requiredCapabilities: ["hr.csf.read", "hr.csf.write"],
  },
  {
    href: hrPerformanceRoutePaths.hub,
    label: "Performance Appraisals",
    requiredCapabilities: [
      "hr.performance.read",
      "hr.performance.write",
      "hr.performance.approve",
    ],
  },
  {
    href: hrPayrollProcessingRoutePaths.payrollProcessing,
    label: "Payroll Processing",
    requiredCapabilities: ["hr.payroll.read", "hr.payroll.write", "hr.payroll.approve"],
  },
  {
    href: hrLamRoutePaths.hub,
    label: "Leave & Attendance",
    requiredCapabilities: [
      "hr.leave.read",
      "hr.leave.write",
      "hr.attendance.read",
      "hr.attendance.write",
    ],
  },
  {
    href: hrLamRoutePaths.leave,
    label: "Leave",
    requiredCapabilities: ["hr.leave.read", "hr.leave.write"],
  },
  {
    href: hrLamRoutePaths.attendance,
    label: "Attendance",
    requiredCapabilities: ["hr.attendance.read", "hr.attendance.write"],
  },
  {
    href: hrFwaRoutePaths.hub,
    label: "Flexible Work",
    requiredCapabilities: ["hr.fwa.read", "hr.fwa.write"],
  },
  {
    href: hrGeoRoutePaths.hub,
    label: "Geolocation",
    requiredCapabilities: ["hr.geo.read", "hr.geo.write"],
  },
  {
    href: hrAatRoutePaths.hub,
    label: "Absence Analytics",
    requiredCapabilities: [
      "hr.leave.read",
      "hr.leave.write",
      "hr.attendance.read",
      "hr.attendance.write",
      "hr.compliance.read",
    ],
  },
] as const satisfies readonly HrModuleNavItem[];

export function resolveHrModuleNavItems(
  capabilities: readonly AppCapability[],
): HrModuleNavItem[] {
  const granted = new Set(capabilities);

  return hrModuleNavItems.filter((item) =>
    item.requiredCapabilities.some((capability) => granted.has(capability)),
  );
}
