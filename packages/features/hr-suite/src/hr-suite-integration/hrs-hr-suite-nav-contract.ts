import type { AppCapability } from "@afenda/kernel";

import { hrComplianceRoutePaths } from "../employee-management/compliance-regulatory-tracking/hr.workforce.compliance-route.contract";
import { hrDocumentsRoutePaths } from "../employee-management/documents-management/hr.workforce.documents-route.contract";
import { hrLifecycleRoutePaths } from "../employee-management/employee-lifecycle-management/hr.workforce.lifecycle-route.contract";
import { hrOffboardingRoutePaths } from "../employee-management/offboarding-exit-management/hr.workforce.offboarding-route.contract";
import { hrOrgRoutePaths } from "../employee-management/organizational-chart-hierarchy/hr.workforce.org-route.contract";
import { hrBenefitsRoutePaths } from "../payroll-compensation/benefits-administration/hr.payroll.benefits-route.contract";
import { hrBonusRoutePaths } from "../payroll-compensation/bonus-incentive-management/hr.payroll.bonus-route.contract";
import { hrExpenseRoutePaths } from "../payroll-compensation/expenses-reimbursement/hr.payroll.expense-route.contract";
import { hrCpmRoutePaths } from "../payroll-compensation/compensation-planning-modeling/hr.payroll.cpm-route.contract";
import { hrCsfRoutePaths } from "../talent-management/competency-skills-framework/hr.talent.csf-route.contract";
import { hrPerformanceRoutePaths } from "../talent-management/performance-appraisals/hr.talent.performance-route.contract";
import { hrRonRoutePaths } from "../talent-management/recruitment-onboarding/hr.talent.ron-route.contract";
import { hrSuccessionRoutePaths } from "../talent-management/succession-planning/hr.talent.succession-route.contract";
import { hrTrainingRoutePaths } from "../talent-management/training-development/hr.talent.training-route.contract";
import { hrIndustryFhcRoutePaths } from "../industry-specific/food-handler-certification-health-compliance/hr.industry.fhc-route.contract";
import { hrIndustryFrmRoutePaths } from "../industry-specific/field-worker-remote-workforce-management/hr.industry.frm-route.contract";
import { hrIndustryGpgRoutePaths } from "../industry-specific/government-classification-pay-grades/hr.industry.gpg-route.contract";
import { hrIndustryMscRoutePaths } from "../industry-specific/manufacturing-safety-training-osha-compliance/hr.industry.msc-route.contract";
import { hrIndustryRwsRoutePaths } from "../industry-specific/retail-seasonal-hourly-workforce-scheduling/hr.industry.rws-route.contract";
import { hrIndustryUcbRoutePaths } from "../industry-specific/union-management/hr.industry.ucb-route.contract";
import { hrPayrollProcessingRoutePaths } from "../payroll-compensation/payroll-processing/hr.payroll.processing-route.contract";
import { hrAatRoutePaths } from "../time-attendance/absence-analytics-trends/hr.time.aat-route.contract";
import { hrRecordsRoutePaths } from "../employee-management/employee-records-management/hr.workforce.records-route.contract";
import { hrLamRoutePaths } from "../time-attendance/leave-attendance-management/hr.time.lam-route.contract";
import { hrFwaRoutePaths } from "../time-attendance/flexible-work-arrangement-tracking/hr.time.fwa-route.contract";
import { hrGeoRoutePaths } from "../time-attendance/geolocation-remote-checkin/hr.time.geo-route.contract";
import { hrTalentRssRoutePaths } from "../talent-management/candidate-selfservice-portal/hr.talent.rss-route.contract";
import { hrWorkforceEssRoutePaths } from "../employee-management/employee-selfservice-portal/hr.workforce.ess-route.contract";
import { hrTalentEngRoutePaths } from "../talent-management/employee-engagement-surveys/hr.talent.eng-route.contract";

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
    href: hrRonRoutePaths.hub,
    label: "Recruitment & Onboarding",
    requiredCapabilities: [
      "hr.recruitment.read",
      "hr.recruitment.write",
      "hr.recruitment.approve",
    ],
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
    href: hrSuccessionRoutePaths.hub,
    label: "Succession Planning",
    requiredCapabilities: [
      "hr.succession.read",
      "hr.succession.write",
      "hr.succession.approve",
    ],
  },
  {
    href: hrTrainingRoutePaths.hub,
    label: "Training & Development",
    requiredCapabilities: [
      "hr.training.read",
      "hr.training.write",
      "hr.training.approve",
    ],
  },
  {
    href: hrIndustryFrmRoutePaths.hub,
    label: "Field Workforce",
    requiredCapabilities: ["hr.frm.read", "hr.frm.write", "hr.frm.approve"],
  },
  {
    href: hrIndustryFhcRoutePaths.hub,
    label: "Food Handler Compliance",
    requiredCapabilities: ["hr.fhc.read", "hr.fhc.write", "hr.fhc.approve"],
  },
  {
    href: hrIndustryGpgRoutePaths.hub,
    label: "Government Pay Grades",
    requiredCapabilities: ["hr.gpg.read", "hr.gpg.write", "hr.gpg.approve"],
  },
  {
    href: hrIndustryMscRoutePaths.hub,
    label: "Manufacturing Safety",
    requiredCapabilities: ["hr.msc.read", "hr.msc.write", "hr.msc.approve"],
  },
  {
    href: hrIndustryRwsRoutePaths.hub,
    label: "Retail Scheduling",
    requiredCapabilities: ["hr.rws.read", "hr.rws.write", "hr.rws.approve"],
  },
  {
    href: hrIndustryUcbRoutePaths.hub,
    label: "Union Management",
    requiredCapabilities: ["hr.ucb.read", "hr.ucb.write", "hr.ucb.approve"],
  },
  {
    href: hrPayrollProcessingRoutePaths.payrollProcessing,
    label: "Payroll Processing",
    requiredCapabilities: [
      "hr.payroll.read",
      "hr.payroll.write",
      "hr.payroll.approve",
    ],
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

  {
    href: hrTalentRssRoutePaths.hub,
    label: "Candidate Self-Service Portal",
    requiredCapabilities: ["hr.rss.read", "hr.rss.write", "hr.rss.approve"],
  },

  {
    href: hrWorkforceEssRoutePaths.hub,
    label: "Employee Self-Service Portal",
    requiredCapabilities: ["hr.ess.read", "hr.ess.write", "hr.ess.approve"],
  },

  {
    href: hrTalentEngRoutePaths.hub,
    label: "Employee Engagement Surveys",
    requiredCapabilities: ["hr.eng.read", "hr.eng.write", "hr.eng.approve"],
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
