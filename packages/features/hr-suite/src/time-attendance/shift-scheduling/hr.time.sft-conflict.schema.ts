import { z } from "zod";

import { hrSftAssignmentKindSchema } from "./hr.time.sft-availability.schema";
import { hrSftSchedulingPolicySchema } from "./hr.time.sft-policy.schema";

/** Conflict kinds surfaced during assignment validation (HRM-SFT-011 … HRM-SFT-015). */
export const hrSftConflictKindSchema = z.enum([
  "availability_unavailable",
  "leave_approved",
  "shift_overlap",
  "insufficient_rest",
  "weekly_hours_exceeded",
]);

export type HrSftConflictKind = z.infer<typeof hrSftConflictKindSchema>;

export const hrSftConflictRequirementCodeSchema = z.enum([
  "HRM-SFT-011",
  "HRM-SFT-012",
  "HRM-SFT-013",
  "HRM-SFT-014",
  "HRM-SFT-015",
]);

export type HrSftConflictRequirementCode = z.infer<
  typeof hrSftConflictRequirementCodeSchema
>;

export const hrSftAssignmentConflictSchema = z.object({
  code: hrSftConflictKindSchema,
  requirementCode: hrSftConflictRequirementCodeSchema,
  message: z.string(),
  relatedAssignmentId: z.string().optional(),
  relatedLeaveRequestId: z.string().optional(),
  relatedAvailabilityId: z.string().optional(),
});

export type HrSftAssignmentConflict = z.infer<
  typeof hrSftAssignmentConflictSchema
>;

export const hrSftConflictValidationResultSchema = z.object({
  requirementCodes: z.array(hrSftConflictRequirementCodeSchema),
  hasConflicts: z.boolean(),
  conflicts: z.array(hrSftAssignmentConflictSchema),
});

export type HrSftConflictValidationResult = z.infer<
  typeof hrSftConflictValidationResultSchema
>;

/** Serializable shift slice used by pure conflict validators. */
export const hrSftShiftSliceSchema = z.object({
  assignmentId: z.string().optional(),
  employeeId: z.string(),
  assignmentKind: hrSftAssignmentKindSchema,
  shiftDate: z.coerce.date(),
  shiftStart: z.coerce.date(),
  shiftEnd: z.coerce.date(),
  workingHoursMinutes: z.number().int().nonnegative(),
});

export type HrSftShiftSlice = z.infer<typeof hrSftShiftSliceSchema>;

export const hrSftApprovedLeaveSliceSchema = z.object({
  leaveRequestId: z.string(),
  employeeId: z.string(),
  leaveType: z.string(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
});

export type HrSftApprovedLeaveSlice = z.infer<
  typeof hrSftApprovedLeaveSliceSchema
>;

export const hrSftAvailabilitySliceSchema = z.object({
  availabilityId: z.string(),
  employeeId: z.string(),
  availabilityKind: z.enum(["unavailable", "preferred", "blocked"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export type HrSftAvailabilitySlice = z.infer<
  typeof hrSftAvailabilitySliceSchema
>;

export const hrSftConflictValidationInputSchema = z.object({
  proposed: hrSftShiftSliceSchema,
  existingAssignments: z.array(hrSftShiftSliceSchema),
  approvedLeaves: z.array(hrSftApprovedLeaveSliceSchema),
  availabilityWindows: z.array(hrSftAvailabilitySliceSchema),
  policy: hrSftSchedulingPolicySchema,
  excludeAssignmentId: z.string().optional(),
});

export type HrSftConflictValidationInput = z.infer<
  typeof hrSftConflictValidationInputSchema
>;

export const validateHrSftAssignmentConflictsQuerySchema = z.object({
  employeeId: z.string().trim().min(1),
  templateId: z.string().trim().min(1),
  shiftDate: z.coerce.date(),
  assignmentKind: hrSftAssignmentKindSchema.default("shift"),
  excludeAssignmentId: z.string().trim().min(1).optional(),
});

export type ValidateHrSftAssignmentConflictsQuery = z.infer<
  typeof validateHrSftAssignmentConflictsQuerySchema
>;

export const SFT_CONFLICT_REQUIREMENT_COVERAGE = [
  { code: "HRM-SFT-011", kind: "availability_unavailable" },
  { code: "HRM-SFT-012", kind: "leave_approved" },
  { code: "HRM-SFT-013", kind: "shift_overlap" },
  { code: "HRM-SFT-014", kind: "insufficient_rest" },
  { code: "HRM-SFT-015", kind: "weekly_hours_exceeded" },
] as const;

export function assertSftConflictRequirementCoverageComplete(): void {
  const codes = SFT_CONFLICT_REQUIREMENT_COVERAGE.map((row) => row.code);
  for (let index = 9; index <= 15; index += 1) {
    const padded = String(index).padStart(3, "0");
    const code = `HRM-SFT-${padded}`;
    if (index >= 11 && !codes.includes(code as HrSftConflictRequirementCode)) {
      throw new Error(`sft_conflict_coverage_missing:${code}`);
    }
  }
}
