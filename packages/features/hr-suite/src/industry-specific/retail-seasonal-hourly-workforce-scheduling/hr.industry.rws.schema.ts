import { z } from "zod";

import {
  HR_RWS_AVAILABILITY_STATUSES,
  HR_RWS_BUDGET_STATUSES,
  HR_RWS_COMPLIANCE_RULES,
  HR_RWS_COMPLIANCE_SEVERITIES,
  HR_RWS_COVERAGE_STATUSES,
  HR_RWS_DEMAND_SOURCES,
  HR_RWS_INTEGRATION_TARGETS,
  HR_RWS_NOTIFICATION_TYPES,
  HR_RWS_OPEN_SHIFT_STATUSES,
  HR_RWS_PERIOD_TYPES,
  HR_RWS_RETAIL_ROLES,
  HR_RWS_SCHEDULE_STATUSES,
  HR_RWS_SHIFT_TYPES,
  HR_RWS_SWAP_STATUSES,
  HR_RWS_WORKER_TYPES,
} from "./hr.industry.rws-constants.shared";

const optionalDate = z.string().date().optional();
const money = z.number().finite().nonnegative();
const hours = z.number().finite().nonnegative();

export const hrRwsRetailScheduleSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleCode: z.string().min(1),
  title: z.string().min(1),
  legalEntity: z.string().min(1),
  storeId: z.string().min(1),
  storeName: z.string().min(1),
  branchName: z.string().optional(),
  departmentName: z.string().min(1),
  teamName: z.string().optional(),
  roleName: z.string().optional(),
  managerEmployeeId: z.string().min(1),
  managerDisplayName: z.string().min(1),
  periodType: z.enum(HR_RWS_PERIOD_TYPES),
  campaignRef: z.string().optional(),
  seasonName: z.string().optional(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  status: z.enum(HR_RWS_SCHEDULE_STATUSES),
  publishedAt: optionalDate,
  scheduledHours: hours,
  scheduledLaborCost: money,
  budgetAmount: money,
  budgetStatus: z.enum(HR_RWS_BUDGET_STATUSES),
  overtimeRiskCount: z.number().int().nonnegative(),
  coverageGapCount: z.number().int().nonnegative(),
  complianceFindingCount: z.number().int().nonnegative(),
});

export const hrRwsShiftAssignmentSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  workerType: z.enum(HR_RWS_WORKER_TYPES),
  storeId: z.string().min(1),
  storeName: z.string().min(1),
  departmentName: z.string().min(1),
  roleName: z.enum(HR_RWS_RETAIL_ROLES),
  managerEmployeeId: z.string().min(1),
  managerDisplayName: z.string().min(1),
  shiftType: z.enum(HR_RWS_SHIFT_TYPES),
  shiftDate: z.string().date(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  scheduledHours: hours,
  actualHours: hours.optional(),
  availabilityStatus: z.enum(HR_RWS_AVAILABILITY_STATUSES),
  skillValidated: z.boolean(),
  certificationRefs: z.array(z.string()),
  complianceStatus: z.enum(["clear", "warning", "blocked"]),
  payrollReferenceStatus: z.enum(["ready", "exposed", "blocked"]),
});

export const hrRwsAvailabilityPreferenceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  dayOfWeek: z.string().min(1),
  timeWindow: z.string().min(1),
  shiftType: z.enum(HR_RWS_SHIFT_TYPES),
  maxWeeklyHours: hours,
  status: z.enum(HR_RWS_AVAILABILITY_STATUSES),
});

export const hrRwsBlockedDateSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  blockedDate: z.string().date(),
  reason: z.string().min(1),
  sourceRef: z.string().optional(),
  status: z.enum(["active", "released"]),
});

export const hrRwsCoverageRequirementSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleId: z.string().min(1),
  storeName: z.string().min(1),
  departmentName: z.string().min(1),
  roleName: z.enum(HR_RWS_RETAIL_ROLES),
  coverageDate: z.string().date(),
  hourWindow: z.string().min(1),
  requiredCount: z.number().int().nonnegative(),
  scheduledCount: z.number().int().nonnegative(),
  status: z.enum(HR_RWS_COVERAGE_STATUSES),
});

export const hrRwsOpenShiftSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleId: z.string().min(1),
  storeName: z.string().min(1),
  departmentName: z.string().min(1),
  roleName: z.enum(HR_RWS_RETAIL_ROLES),
  shiftType: z.enum(HR_RWS_SHIFT_TYPES),
  shiftDate: z.string().date(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  approvalRequired: z.boolean(),
  claimantEmployeeId: z.string().optional(),
  claimantDisplayName: z.string().optional(),
  eligibleEmployeeIds: z.array(z.string()),
  status: z.enum(HR_RWS_OPEN_SHIFT_STATUSES),
});

export const hrRwsShiftSwapRequestSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleId: z.string().min(1),
  requesterEmployeeId: z.string().min(1),
  requesterDisplayName: z.string().min(1),
  replacementEmployeeId: z.string().min(1),
  replacementDisplayName: z.string().min(1),
  originalShiftRef: z.string().min(1),
  replacementShiftRef: z.string().min(1),
  validationFlags: z.array(z.string()),
  approvalWorkflowRef: z.string().optional(),
  decisionReason: z.string().optional(),
  decidedBy: z.string().optional(),
  status: z.enum(HR_RWS_SWAP_STATUSES),
});

export const hrRwsLaborDemandReferenceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  storeName: z.string().min(1),
  periodLabel: z.string().min(1),
  demandSource: z.enum(HR_RWS_DEMAND_SOURCES),
  demandValue: z.number().finite().nonnegative(),
  requiredHours: hours,
  referenceRef: z.string().min(1),
});

export const hrRwsLaborBudgetSnapshotSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleId: z.string().min(1),
  storeName: z.string().min(1),
  departmentName: z.string().min(1),
  scheduledHours: hours,
  scheduledLaborCost: money,
  budgetAmount: money,
  varianceAmount: z.number().finite(),
  status: z.enum(HR_RWS_BUDGET_STATUSES),
});

export const hrRwsComplianceFindingSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleId: z.string().min(1),
  employeeId: z.string().optional(),
  employeeDisplayName: z.string().optional(),
  rule: z.enum(HR_RWS_COMPLIANCE_RULES),
  finding: z.string().min(1),
  severity: z.enum(HR_RWS_COMPLIANCE_SEVERITIES),
  overrideRequired: z.boolean(),
  overrideReason: z.string().optional(),
});

export const hrRwsNotificationSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  notificationType: z.enum(HR_RWS_NOTIFICATION_TYPES),
  employeeId: z.string().optional(),
  employeeDisplayName: z.string().optional(),
  targetRef: z.string().min(1),
  recipients: z.array(z.string()),
  generatedAt: z.string().datetime(),
  status: z.enum(["queued", "sent", "acknowledged", "failed"]),
});

export const hrRwsAttendanceComparisonSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  scheduledHours: hours,
  actualHours: hours,
  varianceHours: z.number().finite(),
  attendanceOutcomeRef: z.string().min(1),
  status: z.enum(["matched", "variance", "missing_actual"]),
});

export const hrRwsPayrollReferenceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  scheduleId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  scheduledHours: hours,
  actualHoursRef: z.string().optional(),
  shiftPremiumRef: z.string().optional(),
  holidayWorkRef: z.string().optional(),
  attendanceOutcomeRef: z.string().min(1),
  status: z.enum(["ready", "exposed", "blocked"]),
});

export const hrRwsIntegrationExposureSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  integrationTarget: z.enum(HR_RWS_INTEGRATION_TARGETS),
  sourceRef: z.string().min(1),
  summary: z.string().min(1),
  employeeId: z.string().optional(),
  employeeDisplayName: z.string().optional(),
  exposedAt: z.string().datetime(),
  status: z.enum(["ready", "exposed", "blocked"]),
});

export const hrIndustryRwsListRowSchema = z.object({
  id: z.string().min(1),
  cells: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  rowHref: z.string().optional(),
  rowTone: z.enum(["attention", "critical"]).optional(),
});

export type HrRwsRetailScheduleInput = z.infer<typeof hrRwsRetailScheduleSchema>;
export type HrRwsShiftAssignmentInput = z.infer<typeof hrRwsShiftAssignmentSchema>;
export type HrRwsAvailabilityPreferenceInput = z.infer<
  typeof hrRwsAvailabilityPreferenceSchema
>;
export type HrRwsBlockedDateInput = z.infer<typeof hrRwsBlockedDateSchema>;
export type HrRwsCoverageRequirementInput = z.infer<
  typeof hrRwsCoverageRequirementSchema
>;
export type HrRwsOpenShiftInput = z.infer<typeof hrRwsOpenShiftSchema>;
export type HrRwsShiftSwapRequestInput = z.infer<
  typeof hrRwsShiftSwapRequestSchema
>;
export type HrRwsLaborDemandReferenceInput = z.infer<
  typeof hrRwsLaborDemandReferenceSchema
>;
export type HrRwsLaborBudgetSnapshotInput = z.infer<
  typeof hrRwsLaborBudgetSnapshotSchema
>;
export type HrRwsComplianceFindingInput = z.infer<
  typeof hrRwsComplianceFindingSchema
>;
export type HrRwsNotificationInput = z.infer<typeof hrRwsNotificationSchema>;
export type HrRwsAttendanceComparisonInput = z.infer<
  typeof hrRwsAttendanceComparisonSchema
>;
export type HrRwsPayrollReferenceInput = z.infer<
  typeof hrRwsPayrollReferenceSchema
>;
export type HrRwsIntegrationExposureInput = z.infer<
  typeof hrRwsIntegrationExposureSchema
>;
export type HrIndustryRwsListRowInput = z.infer<typeof hrIndustryRwsListRowSchema>;
