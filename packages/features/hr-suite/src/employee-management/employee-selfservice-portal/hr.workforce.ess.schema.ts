import { z } from "zod";

import {
  HR_WORKFORCE_ESS_APPROVAL_TYPES,
  HR_WORKFORCE_ESS_ATTENDANCE_STATUSES,
  HR_WORKFORCE_ESS_CLAIM_TYPES,
  HR_WORKFORCE_ESS_CONSENT_STATUSES,
  HR_WORKFORCE_ESS_DOCUMENT_TYPES,
  HR_WORKFORCE_ESS_EMPLOYMENT_STATUSES,
  HR_WORKFORCE_ESS_LEAVE_TYPES,
  HR_WORKFORCE_ESS_NOTIFICATION_EVENTS,
  HR_WORKFORCE_ESS_NOTIFICATION_STATUSES,
  HR_WORKFORCE_ESS_PAY_DOCUMENT_TYPES,
  HR_WORKFORCE_ESS_PRIVACY_TIERS,
  HR_WORKFORCE_ESS_PROFILE_UPDATE_FIELDS,
  HR_WORKFORCE_ESS_REQUEST_STATUSES,
  HR_WORKFORCE_ESS_RESOURCE_TYPES,
  HR_WORKFORCE_ESS_TASK_STATUSES,
  HR_WORKFORCE_ESS_TASK_TYPES,
} from "./hr.workforce.ess-constants.shared";

const isoDateTime = z.string().datetime();
const optionalIsoDateTime = isoDateTime.optional();

export const hrWorkforceEssEmployeeProfileSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeNumber: z.string().min(1),
  userId: z.string().min(1),
  displayName: z.string().min(1),
  preferredName: z.string().min(1).optional(),
  department: z.string().min(1),
  managerUserId: z.string().min(1),
  managerName: z.string().min(1),
  jobTitle: z.string().min(1),
  workLocation: z.string().min(1),
  employmentStatus: z.enum(HR_WORKFORCE_ESS_EMPLOYMENT_STATUSES),
  personalEmailMasked: z.string().min(1),
  phoneMasked: z.string().min(1),
  addressMasked: z.string().min(1),
  emergencyContactMasked: z.string().min(1),
  privacyTier: z.enum(HR_WORKFORCE_ESS_PRIVACY_TIERS),
  locale: z.string().min(2),
  lastPortalAccessAt: optionalIsoDateTime,
});

export const hrWorkforceEssProfileUpdateRequestSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  requestRef: z.string().min(1),
  fieldGroup: z.enum(HR_WORKFORCE_ESS_PROFILE_UPDATE_FIELDS),
  status: z.enum(HR_WORKFORCE_ESS_REQUEST_STATUSES),
  sensitive: z.boolean(),
  submittedAt: isoDateTime,
  decidedAt: optionalIsoDateTime,
  approverUserId: z.string().min(1).optional(),
  rejectionReason: z.string().optional(),
  correctionGuidance: z.string().optional(),
});

export const hrWorkforceEssLeaveBalanceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  leaveType: z.enum(HR_WORKFORCE_ESS_LEAVE_TYPES),
  entitlementDays: z.number().nonnegative(),
  usedDays: z.number().nonnegative(),
  pendingDays: z.number().nonnegative(),
  availableDays: z.number(),
  period: z.string().min(1),
});

export const hrWorkforceEssLeaveRequestSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  requestRef: z.string().min(1),
  leaveType: z.enum(HR_WORKFORCE_ESS_LEAVE_TYPES),
  startDate: z.string().min(10),
  endDate: z.string().min(10),
  days: z.number().positive(),
  status: z.enum(HR_WORKFORCE_ESS_REQUEST_STATUSES),
  submittedAt: isoDateTime,
  decidedAt: optionalIsoDateTime,
  approverUserId: z.string().min(1),
  rejectionReason: z.string().optional(),
  correctionGuidance: z.string().optional(),
});

export const hrWorkforceEssPayDocumentSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  documentRef: z.string().min(1),
  documentType: z.enum(HR_WORKFORCE_ESS_PAY_DOCUMENT_TYPES),
  period: z.string().min(1),
  grossPayMasked: z.string().min(1),
  netPayMasked: z.string().min(1),
  authorized: z.boolean(),
  privacyTier: z.enum(HR_WORKFORCE_ESS_PRIVACY_TIERS),
  availableAt: isoDateTime,
  downloadedAt: optionalIsoDateTime,
});

export const hrWorkforceEssAttendanceRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  workDate: z.string().min(10),
  clockInAt: optionalIsoDateTime,
  clockOutAt: optionalIsoDateTime,
  status: z.enum(HR_WORKFORCE_ESS_ATTENDANCE_STATUSES),
  overtimeHours: z.number().nonnegative(),
  latenessMinutes: z.number().int().nonnegative(),
});

export const hrWorkforceEssShiftScheduleSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  scheduleDate: z.string().min(10),
  shiftName: z.string().min(1),
  startsAt: isoDateTime,
  endsAt: isoDateTime,
  workLocation: z.string().min(1),
});

export const hrWorkforceEssExpenseClaimSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  claimRef: z.string().min(1),
  claimType: z.enum(HR_WORKFORCE_ESS_CLAIM_TYPES),
  amount: z.number().nonnegative(),
  currency: z.string().min(3),
  status: z.enum(HR_WORKFORCE_ESS_REQUEST_STATUSES),
  receiptCount: z.number().int().nonnegative(),
  submittedAt: isoDateTime,
  reimbursedAt: optionalIsoDateTime,
  rejectionReason: z.string().optional(),
  correctionGuidance: z.string().optional(),
});

export const hrWorkforceEssDocumentReferenceSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  documentRef: z.string().min(1),
  documentType: z.enum(HR_WORKFORCE_ESS_DOCUMENT_TYPES),
  title: z.string().min(1),
  authorized: z.boolean(),
  privacyTier: z.enum(HR_WORKFORCE_ESS_PRIVACY_TIERS),
  expiresAt: optionalIsoDateTime,
  downloadedAt: optionalIsoDateTime,
});

export const hrWorkforceEssResourceCenterItemSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  resourceType: z.enum(HR_WORKFORCE_ESS_RESOURCE_TYPES),
  title: z.string().min(1),
  locale: z.string().min(2),
  audience: z.enum(["all_employees", "managers", "new_hires", "leavers"]),
  effectiveAt: isoDateTime,
});

export const hrWorkforceEssAcknowledgementSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  noticeRef: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(HR_WORKFORCE_ESS_CONSENT_STATUSES),
  dueAt: optionalIsoDateTime,
  acknowledgedAt: optionalIsoDateTime,
});

export const hrWorkforceEssAssignedTaskSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  taskType: z.enum(HR_WORKFORCE_ESS_TASK_TYPES),
  title: z.string().min(1),
  status: z.enum(HR_WORKFORCE_ESS_TASK_STATUSES),
  dueAt: optionalIsoDateTime,
  completedAt: optionalIsoDateTime,
});

export const hrWorkforceEssRequestTrackerSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  requestType: z.enum(HR_WORKFORCE_ESS_APPROVAL_TYPES),
  requestRef: z.string().min(1),
  status: z.enum(HR_WORKFORCE_ESS_REQUEST_STATUSES),
  submittedAt: isoDateTime,
  updatedAt: isoDateTime,
  rejectionReason: z.string().optional(),
  correctionGuidance: z.string().optional(),
});

export const hrWorkforceEssApprovalInboxItemSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  approvalType: z.enum(HR_WORKFORCE_ESS_APPROVAL_TYPES),
  targetId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  approverUserId: z.string().min(1),
  status: z.enum(HR_WORKFORCE_ESS_REQUEST_STATUSES),
  submittedAt: isoDateTime,
  decidedAt: optionalIsoDateTime,
  decisionReason: z.string().optional(),
});

export const hrWorkforceEssNotificationSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  event: z.enum(HR_WORKFORCE_ESS_NOTIFICATION_EVENTS),
  status: z.enum(HR_WORKFORCE_ESS_NOTIFICATION_STATUSES),
  channel: z.enum(["portal", "email", "sms"]),
  message: z.string().min(1),
  sentAt: optionalIsoDateTime,
  readAt: optionalIsoDateTime,
});

export const hrWorkforceEssBenefitEnrollmentSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  benefitName: z.string().min(1),
  coverageSummary: z.string().min(1),
  dependentsCount: z.number().int().nonnegative(),
  status: z.enum(["active", "pending", "waived", "expired"]),
  effectiveAt: isoDateTime,
});

export const hrWorkforceEssTrainingRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  courseName: z.string().min(1),
  status: z.enum(HR_WORKFORCE_ESS_TASK_STATUSES),
  required: z.boolean(),
  certificateRef: z.string().min(1).optional(),
  dueAt: optionalIsoDateTime,
  completedAt: optionalIsoDateTime,
});

export const hrWorkforceEssOnboardingTaskSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(HR_WORKFORCE_ESS_TASK_STATUSES),
  dueAt: optionalIsoDateTime,
  completedAt: optionalIsoDateTime,
});

export const hrWorkforceEssOffboardingTaskSchema =
  hrWorkforceEssOnboardingTaskSchema.extend({
    clearanceOwner: z.string().min(1),
  });

export const hrWorkforceEssConsentRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  consentType: z.enum(["privacy_notice", "policy_notice", "payroll_access"]),
  status: z.enum(HR_WORKFORCE_ESS_CONSENT_STATUSES),
  locale: z.string().min(2),
  capturedAt: optionalIsoDateTime,
});

export const hrWorkforceEssAccessLogSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  actorUserId: z.string().min(1),
  actorRole: z.enum(["employee", "manager", "hr", "auditor"]),
  employeeId: z.string().min(1),
  targetType: z.enum(["profile", "pay_document", "document", "request"]),
  targetId: z.string().min(1),
  privacyTier: z.enum(HR_WORKFORCE_ESS_PRIVACY_TIERS),
  accessReason: z.string().min(1),
  accessedAt: isoDateTime,
});

export const hrWorkforceEssListRowSchema = z.object({
  id: z.string().min(1),
  cells: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
  rowHref: z.string().optional(),
  rowTone: z.enum(["attention", "critical"]).optional(),
});

export type HrWorkforceEssEmployeeProfileInput = z.infer<
  typeof hrWorkforceEssEmployeeProfileSchema
>;
export type HrWorkforceEssProfileUpdateRequestInput = z.infer<
  typeof hrWorkforceEssProfileUpdateRequestSchema
>;
export type HrWorkforceEssLeaveBalanceInput = z.infer<
  typeof hrWorkforceEssLeaveBalanceSchema
>;
export type HrWorkforceEssLeaveRequestInput = z.infer<
  typeof hrWorkforceEssLeaveRequestSchema
>;
export type HrWorkforceEssPayDocumentInput = z.infer<
  typeof hrWorkforceEssPayDocumentSchema
>;
export type HrWorkforceEssAttendanceRecordInput = z.infer<
  typeof hrWorkforceEssAttendanceRecordSchema
>;
export type HrWorkforceEssShiftScheduleInput = z.infer<
  typeof hrWorkforceEssShiftScheduleSchema
>;
export type HrWorkforceEssExpenseClaimInput = z.infer<
  typeof hrWorkforceEssExpenseClaimSchema
>;
export type HrWorkforceEssDocumentReferenceInput = z.infer<
  typeof hrWorkforceEssDocumentReferenceSchema
>;
export type HrWorkforceEssResourceCenterItemInput = z.infer<
  typeof hrWorkforceEssResourceCenterItemSchema
>;
export type HrWorkforceEssAcknowledgementInput = z.infer<
  typeof hrWorkforceEssAcknowledgementSchema
>;
export type HrWorkforceEssAssignedTaskInput = z.infer<
  typeof hrWorkforceEssAssignedTaskSchema
>;
export type HrWorkforceEssRequestTrackerInput = z.infer<
  typeof hrWorkforceEssRequestTrackerSchema
>;
export type HrWorkforceEssApprovalInboxItemInput = z.infer<
  typeof hrWorkforceEssApprovalInboxItemSchema
>;
export type HrWorkforceEssNotificationInput = z.infer<
  typeof hrWorkforceEssNotificationSchema
>;
export type HrWorkforceEssBenefitEnrollmentInput = z.infer<
  typeof hrWorkforceEssBenefitEnrollmentSchema
>;
export type HrWorkforceEssTrainingRecordInput = z.infer<
  typeof hrWorkforceEssTrainingRecordSchema
>;
export type HrWorkforceEssOnboardingTaskInput = z.infer<
  typeof hrWorkforceEssOnboardingTaskSchema
>;
export type HrWorkforceEssOffboardingTaskInput = z.infer<
  typeof hrWorkforceEssOffboardingTaskSchema
>;
export type HrWorkforceEssConsentRecordInput = z.infer<
  typeof hrWorkforceEssConsentRecordSchema
>;
export type HrWorkforceEssAccessLogInput = z.infer<
  typeof hrWorkforceEssAccessLogSchema
>;
export type HrWorkforceEssListRowInput = z.infer<
  typeof hrWorkforceEssListRowSchema
>;
