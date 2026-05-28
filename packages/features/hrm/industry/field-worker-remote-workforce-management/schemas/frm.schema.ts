import { z } from "zod"

import {
  HRM_FRM_ASSIGNMENT_TYPES,
  HRM_FRM_SAFETY_EVENT_TYPES,
  HRM_FRM_TRAVEL_CLASSES,
  HRM_FRM_WORKSITE_TYPES,
} from "./frm-workflow-state.shared"

export const createFrmWorksiteFormSchema = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  worksiteType: z.enum(HRM_FRM_WORKSITE_TYPES),
  countryCode: z.string().max(8).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  approvedRemote: z.boolean().optional(),
})

export const createFrmAssignmentFormSchema = z.object({
  employeeId: z.string().uuid(),
  worksiteId: z.string().uuid(),
  assignmentType: z.enum(HRM_FRM_ASSIGNMENT_TYPES),
  startDate: z.string().min(1).max(32),
  endDate: z.string().max(32).nullable().optional(),
  managerEmployeeId: z.string().uuid().nullable().optional(),
  departmentRef: z.string().max(120).nullable().optional(),
  legalEntityRef: z.string().max(120).nullable().optional(),
  travelApprovalRef: z.string().max(120).nullable().optional(),
})

export const createFrmTravelStatusFormSchema = z.object({
  assignmentId: z.string().uuid(),
  travelClass: z.enum(HRM_FRM_TRAVEL_CLASSES),
  startDate: z.string().min(1).max(32),
  endDate: z.string().max(32).nullable().optional(),
  destinationCountry: z.string().max(8).nullable().optional(),
  destinationCity: z.string().max(120).nullable().optional(),
  travelApprovalRef: z.string().max(120).nullable().optional(),
})

export const createFrmPerDiemRateFormSchema = z.object({
  code: z.string().min(1).max(64),
  countryCode: z.string().max(8).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  travelClass: z.enum(HRM_FRM_TRAVEL_CLASSES).nullable().optional(),
  fullDayAmount: z.string().min(1).max(32),
  currencyCode: z.string().max(8).optional(),
})

export const linkFrmAttendanceFormSchema = z.object({
  assignmentId: z.string().uuid(),
  attendanceEventId: z.string().uuid(),
  eventKind: z.enum(["clock_in", "clock_out", "break_start", "break_end"]),
})

export const resolveFrmExceptionFormSchema = z.object({
  exceptionId: z.string().uuid(),
  correctionRef: z.string().max(200).nullable().optional(),
})

export const createFrmSafetyCheckinFormSchema = z.object({
  assignmentId: z.string().uuid(),
  eventType: z.enum(HRM_FRM_SAFETY_EVENT_TYPES),
  latitude: z.string().max(32).nullable().optional(),
  longitude: z.string().max(32).nullable().optional(),
})

export const approveFrmPerDiemFormSchema = z.object({
  travelStatusId: z.string().uuid(),
  eligibilityDate: z.string().min(1).max(32),
  employeeCategoryRef: z.string().max(120).nullable().optional(),
  policyGroupRef: z.string().max(120).nullable().optional(),
})
