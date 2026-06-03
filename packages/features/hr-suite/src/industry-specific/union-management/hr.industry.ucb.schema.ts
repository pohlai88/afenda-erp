import { z } from "zod";

import {
  HR_UCB_ALERT_TYPES,
  HR_UCB_APPROVAL_STATUSES,
  HR_UCB_CBA_STATUSES,
  HR_UCB_CONFLICT_SEVERITIES,
  HR_UCB_DOWNSTREAM_TARGETS,
  HR_UCB_DUES_STATUSES,
  HR_UCB_GRIEVANCE_CATEGORIES,
  HR_UCB_GRIEVANCE_SEVERITIES,
  HR_UCB_GRIEVANCE_STATUSES,
  HR_UCB_MEETING_STATUSES,
  HR_UCB_MEMBERSHIP_STATUSES,
  HR_UCB_NEGOTIATION_STATUSES,
  HR_UCB_REPRESENTATIVE_ROLES,
  HR_UCB_RULE_TYPES,
  HR_UCB_SENIORITY_DECISION_TYPES,
  HR_UCB_UNION_STATUSES,
  HR_UCB_DISPUTE_TYPES,
} from "./hr.industry.ucb-constants.shared";

const optionalDate = z.string().date().optional();
const moneyRef = z.string().trim().min(1);

export const hrUcbUnionRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  unionCode: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(HR_UCB_UNION_STATUSES),
  representativeRef: z.string().min(1),
  primaryRepresentativeEmployeeId: z.string().optional(),
  activeMemberCount: z.number().int().nonnegative(),
});

export const hrUcbCollectiveBargainingAgreementSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  agreementCode: z.string().min(1),
  unionId: z.string().min(1),
  bargainingUnitId: z.string().min(1),
  title: z.string().min(1),
  version: z.string().min(1),
  effectiveDate: z.string().date(),
  expiryDate: z.string().date(),
  status: z.enum(HR_UCB_CBA_STATUSES),
  applicableWorkforce: z.string().min(1),
  renewalDate: optionalDate,
  negotiationStatus: z.enum(HR_UCB_NEGOTIATION_STATUSES),
  clauses: z.array(z.string().min(1)),
});

export const hrUcbBargainingUnitAssignmentSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  bargainingUnitId: z.string().min(1),
  bargainingUnitName: z.string().min(1),
  unionId: z.string().min(1),
  departmentName: z.string().min(1),
  locationName: z.string().min(1),
  roleName: z.string().min(1),
  coveredWorkforce: z.string().min(1),
  assignmentDate: z.string().date(),
  status: z.enum(["active", "pending", "inactive"]),
});

export const hrUcbMembershipSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  unionId: z.string().min(1),
  bargainingUnitId: z.string().min(1),
  membershipStatus: z.enum(HR_UCB_MEMBERSHIP_STATUSES),
  startDate: z.string().date(),
  endDate: optionalDate,
  duesEligible: z.boolean(),
  restrictedReason: z.string().optional(),
});

export const hrUcbRuleReferenceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  agreementId: z.string().min(1),
  ruleType: z.enum(HR_UCB_RULE_TYPES),
  sourceRef: z.string().min(1),
  summary: z.string().min(1),
  downstreamTargets: z.array(z.enum(HR_UCB_DOWNSTREAM_TARGETS)),
  approvalStatus: z.enum(HR_UCB_APPROVAL_STATUSES),
  status: z.enum(["ready", "exposed", "blocked"]),
});

export const hrUcbSeniorityRankingSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  bargainingUnitId: z.string().min(1),
  roleName: z.string().min(1),
  departmentName: z.string().min(1),
  locationName: z.string().min(1),
  agreementId: z.string().min(1),
  seniorityDate: z.string().date(),
  serviceLengthMonths: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
  rankingScope: z.string().min(1),
  decisionTypes: z.array(z.enum(HR_UCB_SENIORITY_DECISION_TYPES)),
  status: z.enum(["active", "superseded", "under_review"]),
});

export const hrUcbRuleConflictSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  targetRef: z.string().min(1),
  employeeId: z.string().optional(),
  employeeDisplayName: z.string().optional(),
  conflictType: z.enum(["cba_rule", "seniority_rule", "dues_rule"]),
  ruleRef: z.string().min(1),
  severity: z.enum(HR_UCB_CONFLICT_SEVERITIES),
  actionBlocked: z.boolean(),
  summary: z.string().min(1),
  deadlineDate: optionalDate,
  status: z.enum(["open", "acknowledged", "resolved", "blocked"]),
});

export const hrUcbDuesReferenceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  unionId: z.string().min(1),
  bargainingUnitId: z.string().min(1),
  deductionRef: z.string().min(1),
  amountRef: moneyRef,
  approvalStatus: z.enum(HR_UCB_APPROVAL_STATUSES),
  payrollExposureStatus: z.enum(["ready", "exposed", "blocked"]),
  effectiveDate: z.string().date(),
  status: z.enum(HR_UCB_DUES_STATUSES),
});

export const hrUcbGrievanceCaseSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  caseCode: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().min(1),
  departmentName: z.string().min(1),
  locationName: z.string().min(1),
  bargainingUnitId: z.string().min(1),
  agreementId: z.string().min(1),
  agreementClause: z.string().min(1),
  category: z.enum(HR_UCB_GRIEVANCE_CATEGORIES),
  severity: z.enum(HR_UCB_GRIEVANCE_SEVERITIES),
  stepLevel: z.number().int().nonnegative(),
  deadlineDate: z.string().date(),
  hearingDate: optionalDate,
  decision: z.string().optional(),
  escalationLevel: z.number().int().nonnegative(),
  status: z.enum(HR_UCB_GRIEVANCE_STATUSES),
  mediationRef: z.string().optional(),
  arbitrationRef: z.string().optional(),
  legalRef: z.string().optional(),
});

export const hrUcbDisputeReferenceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  grievanceId: z.string().optional(),
  employeeId: z.string().optional(),
  disputeType: z.enum(HR_UCB_DISPUTE_TYPES),
  referenceRef: z.string().min(1),
  summary: z.string().min(1),
  owner: z.string().min(1),
  status: z.enum(["open", "escalated", "resolved", "closed"]),
});

export const hrUcbRepresentativeSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  displayName: z.string().min(1),
  unionId: z.string().min(1),
  representativeRole: z.enum(HR_UCB_REPRESENTATIVE_ROLES),
  assignedDepartment: z.string().min(1),
  assignedSite: z.string().min(1),
  status: z.enum(["active", "backup", "inactive"]),
});

export const hrUcbLaborMeetingSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  meetingCode: z.string().min(1),
  unionId: z.string().min(1),
  agreementId: z.string().optional(),
  scheduledDate: z.string().date(),
  status: z.enum(HR_UCB_MEETING_STATUSES),
  participants: z.array(z.string().min(1)),
  minutesRef: z.string().optional(),
  actionItems: z.array(z.string().min(1)),
  overdueActionCount: z.number().int().nonnegative(),
});

export const hrUcbAlertSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  alertType: z.enum(HR_UCB_ALERT_TYPES),
  targetRef: z.string().min(1),
  summary: z.string().min(1),
  dueDate: z.string().date(),
  severity: z.enum(HR_UCB_CONFLICT_SEVERITIES),
  status: z.enum(["open", "acknowledged", "resolved", "overdue"]),
});

export const hrUcbIntegrationExposureSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  integrationTarget: z.enum(HR_UCB_DOWNSTREAM_TARGETS),
  sourceRef: z.string().min(1),
  summary: z.string().min(1),
  employeeId: z.string().optional(),
  employeeDisplayName: z.string().optional(),
  exposedAt: z.string().datetime(),
  status: z.enum(["ready", "exposed", "blocked"]),
});

export const hrIndustryUcbListRowSchema = z.object({
  id: z.string().min(1),
  cells: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
  rowHref: z.string().optional(),
  rowTone: z.enum(["attention", "critical"]).optional(),
});

export type HrUcbUnionRecordInput = z.infer<typeof hrUcbUnionRecordSchema>;
export type HrUcbCollectiveBargainingAgreementInput = z.infer<
  typeof hrUcbCollectiveBargainingAgreementSchema
>;
export type HrUcbBargainingUnitAssignmentInput = z.infer<
  typeof hrUcbBargainingUnitAssignmentSchema
>;
export type HrUcbMembershipInput = z.infer<typeof hrUcbMembershipSchema>;
export type HrUcbRuleReferenceInput = z.infer<
  typeof hrUcbRuleReferenceSchema
>;
export type HrUcbSeniorityRankingInput = z.infer<
  typeof hrUcbSeniorityRankingSchema
>;
export type HrUcbRuleConflictInput = z.infer<typeof hrUcbRuleConflictSchema>;
export type HrUcbDuesReferenceInput = z.infer<
  typeof hrUcbDuesReferenceSchema
>;
export type HrUcbGrievanceCaseInput = z.infer<
  typeof hrUcbGrievanceCaseSchema
>;
export type HrUcbDisputeReferenceInput = z.infer<
  typeof hrUcbDisputeReferenceSchema
>;
export type HrUcbRepresentativeInput = z.infer<
  typeof hrUcbRepresentativeSchema
>;
export type HrUcbLaborMeetingInput = z.infer<typeof hrUcbLaborMeetingSchema>;
export type HrUcbAlertInput = z.infer<typeof hrUcbAlertSchema>;
export type HrUcbIntegrationExposureInput = z.infer<
  typeof hrUcbIntegrationExposureSchema
>;
export type HrIndustryUcbListRowInput = z.infer<
  typeof hrIndustryUcbListRowSchema
>;
