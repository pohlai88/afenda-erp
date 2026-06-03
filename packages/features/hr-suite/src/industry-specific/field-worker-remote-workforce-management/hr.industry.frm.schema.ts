import { z } from "zod";

import {
  HR_FRM_ALLOWANCE_TYPES,
  HR_FRM_ASSIGNMENT_TYPES,
  HR_FRM_ATTENDANCE_EVENT_TYPES,
  HR_FRM_ATTENDANCE_EXCEPTION_TYPES,
  HR_FRM_COMPLIANCE_STATUSES,
  HR_FRM_GPS_VALIDATION_RESULTS,
  HR_FRM_LOCATION_TYPES,
  HR_FRM_NOTIFICATION_AUDIENCES,
  HR_FRM_OFFLINE_SYNC_STATUSES,
  HR_FRM_SAFETY_CONFIRMATION_TYPES,
  HR_FRM_TRAVEL_STATUSES,
  HR_FRM_TRAVEL_TYPES,
} from "./hr.industry.frm-constants.shared";

const idSchema = z.string().trim().min(1);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}/);
const dateTimeSchema = z.string().datetime().or(dateSchema);

export const hrFrmWorksiteSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  name: idSchema,
  locationType: z.enum(HR_FRM_LOCATION_TYPES),
  legalEntity: idSchema,
  branchCode: z.string().trim().optional(),
  projectCode: z.string().trim().optional(),
  clientName: z.string().trim().optional(),
  region: idSchema,
  geofenceRef: idSchema,
  approvedRemote: z.boolean(),
});

export const hrFrmAssignmentSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  worksiteId: idSchema,
  assignmentType: z.enum(HR_FRM_ASSIGNMENT_TYPES),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  managerEmployeeId: idSchema,
  managerDisplayName: idSchema,
  departmentName: idSchema,
  legalEntity: idSchema,
  eligibleForMobileAttendance: z.boolean(),
  breakCaptureEnabled: z.boolean(),
  offlineCaptureEnabled: z.boolean(),
  travelApprovalRequired: z.boolean(),
  status: z.enum(["planned", "active", "completed", "suspended"]),
});

export const hrFrmMobileAttendanceSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  assignmentId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  eventType: z.enum(HR_FRM_ATTENDANCE_EVENT_TYPES),
  capturedAt: dateTimeSchema,
  gpsValidationRef: idSchema,
  gpsValidationResult: z.enum(HR_FRM_GPS_VALIDATION_RESULTS),
  validatedAgainstAssignedSite: z.boolean(),
  offline: z.boolean(),
  deviceId: idSchema,
});

export const hrFrmAttendanceExceptionSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  assignmentId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  exceptionType: z.enum(HR_FRM_ATTENDANCE_EXCEPTION_TYPES),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "reviewing", "resolved", "waived"]),
  detectedAt: dateTimeSchema,
  correctionRef: idSchema.optional(),
});

export const hrFrmOfflineSyncSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  attendanceEventId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  capturedAt: dateTimeSchema,
  syncedAt: dateTimeSchema.optional(),
  status: z.enum(HR_FRM_OFFLINE_SYNC_STATUSES),
  reconciliationNote: idSchema.optional(),
});

export const hrFrmScheduleRefSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  worksiteId: idSchema,
  date: dateSchema,
  projectCode: idSchema,
  routeCode: idSchema,
  clientName: idSchema,
  plannedStartAt: dateTimeSchema,
  plannedEndAt: dateTimeSchema,
});

export const hrFrmTravelStatusSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  assignmentId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  travelType: z.enum(HR_FRM_TRAVEL_TYPES),
  status: z.enum(HR_FRM_TRAVEL_STATUSES),
  destination: idSchema,
  country: idSchema,
  city: idSchema,
  durationHours: z.number().nonnegative(),
  employeeCategory: idSchema,
  policyGroup: idSchema,
  approvalRef: idSchema.optional(),
  startsAt: dateTimeSchema,
  endsAt: dateTimeSchema,
});

export const hrFrmPerDiemRateSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  country: idSchema,
  city: idSchema.optional(),
  region: idSchema.optional(),
  projectCode: idSchema.optional(),
  grade: idSchema.optional(),
  travelType: z.enum(HR_FRM_TRAVEL_TYPES),
  allowanceType: z.enum(HR_FRM_ALLOWANCE_TYPES),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
});

export const hrFrmPerDiemReferenceSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  travelStatusId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  allowanceType: z.enum(HR_FRM_ALLOWANCE_TYPES),
  eligible: z.boolean(),
  eligibleDays: z.number().nonnegative(),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  approvalStatus: z.enum(["pending", "approved", "rejected"]),
  payrollRef: idSchema.optional(),
  expenseRef: idSchema.optional(),
});

export const hrFrmTravelComplianceSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  travelStatusId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  complianceStatus: z.enum(HR_FRM_COMPLIANCE_STATUSES),
  approvalRef: idSchema.optional(),
  destinationRestrictionRef: idSchema.optional(),
  requiredDocumentRef: idSchema.optional(),
  insuranceRef: idSchema.optional(),
  dutyOfCareStatus: z.enum(["open", "acknowledged", "closed"]),
});

export const hrFrmSafetyConfirmationSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  assignmentId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  confirmationType: z.enum(HR_FRM_SAFETY_CONFIRMATION_TYPES),
  confirmedAt: dateTimeSchema,
  emergencyContactRef: idSchema.optional(),
  gpsValidationRef: idSchema.optional(),
});

export const hrFrmNotificationSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  audience: z.enum(HR_FRM_NOTIFICATION_AUDIENCES),
  subject: idSchema,
  severity: z.enum(["info", "warning", "critical"]),
  status: z.enum(["queued", "sent", "acknowledged"]),
  employeeId: idSchema.optional(),
  targetRef: idSchema,
  sentAt: dateTimeSchema,
});

export type HrFrmWorksiteInput = z.infer<typeof hrFrmWorksiteSchema>;
export type HrFrmAssignmentInput = z.infer<typeof hrFrmAssignmentSchema>;
export type HrFrmMobileAttendanceInput = z.infer<
  typeof hrFrmMobileAttendanceSchema
>;
export type HrFrmAttendanceExceptionInput = z.infer<
  typeof hrFrmAttendanceExceptionSchema
>;
export type HrFrmOfflineSyncInput = z.infer<typeof hrFrmOfflineSyncSchema>;
export type HrFrmScheduleRefInput = z.infer<typeof hrFrmScheduleRefSchema>;
export type HrFrmTravelStatusInput = z.infer<typeof hrFrmTravelStatusSchema>;
export type HrFrmPerDiemRateInput = z.infer<typeof hrFrmPerDiemRateSchema>;
export type HrFrmPerDiemReferenceInput = z.infer<
  typeof hrFrmPerDiemReferenceSchema
>;
export type HrFrmTravelComplianceInput = z.infer<
  typeof hrFrmTravelComplianceSchema
>;
export type HrFrmSafetyConfirmationInput = z.infer<
  typeof hrFrmSafetyConfirmationSchema
>;
export type HrFrmNotificationInput = z.infer<typeof hrFrmNotificationSchema>;
