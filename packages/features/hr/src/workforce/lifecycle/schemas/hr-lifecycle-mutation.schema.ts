import { z } from "zod";
import { HR_EMPLOYMENT_STATUSES } from "../../employees/contracts/hr-employee.contract";
import {
  HR_MOVEMENT_KINDS,
  HR_PROBATION_OUTCOMES,
} from "../contracts/hr-lifecycle.contract";

export const hrChangeEmploymentStatusActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  toStatus: z.enum(HR_EMPLOYMENT_STATUSES),
  effectiveDate: z.coerce.date().optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrProbationOutcomeActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  outcome: z.enum(HR_PROBATION_OUTCOMES),
  effectiveDate: z.coerce.date().optional(),
  probationEndDate: z.coerce.date().optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrRecordMovementActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  movementKind: z.enum(HR_MOVEMENT_KINDS),
  currentDepartmentId: z.string().trim().optional(),
  currentPositionId: z.string().trim().optional(),
  managerEmployeeId: z.string().trim().optional(),
  reason: z.string().trim().max(2000).optional(),
});
