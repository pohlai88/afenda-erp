import { z } from "zod";

export const HR_LIFECYCLE_MOVEMENT_KINDS = [
  "promotion",
  "transfer",
  "demotion",
  "job_change",
  "department_change",
  "manager_change",
  "grade_change",
  "location_change",
] as const;

export const hrLifecycleMovementKindSchema = z.enum(HR_LIFECYCLE_MOVEMENT_KINDS);

export const hrLifecycleMovementFormSchema = z.object({
  employeeId: z.string().min(1),
  movementKind: hrLifecycleMovementKindSchema,
  effectiveDate: z.coerce.date().optional(),
  currentDepartmentId: z.string().trim().optional(),
  currentPositionId: z.string().trim().optional(),
  managerEmployeeId: z.string().trim().optional(),
  grade: z.string().trim().optional(),
  workLocationCode: z.string().trim().optional(),
  reason: z.string().trim().max(2000).optional(),
  approvalReference: z.string().trim().max(500).optional(),
});

function readLifecycleFormField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseHrLifecycleMovementForm(formData: FormData) {
  const effectiveDateRaw = readLifecycleFormField(formData, "effectiveDate");
  return hrLifecycleMovementFormSchema.safeParse({
    employeeId: readLifecycleFormField(formData, "employeeId"),
    movementKind: readLifecycleFormField(formData, "movementKind"),
    effectiveDate: effectiveDateRaw ? new Date(effectiveDateRaw) : undefined,
    currentDepartmentId: readLifecycleFormField(formData, "currentDepartmentId"),
    currentPositionId: readLifecycleFormField(formData, "currentPositionId"),
    managerEmployeeId: readLifecycleFormField(formData, "managerEmployeeId"),
    grade: readLifecycleFormField(formData, "grade"),
    workLocationCode: readLifecycleFormField(formData, "workLocationCode"),
    reason: readLifecycleFormField(formData, "reason"),
    approvalReference: readLifecycleFormField(formData, "approvalReference"),
  });
}
