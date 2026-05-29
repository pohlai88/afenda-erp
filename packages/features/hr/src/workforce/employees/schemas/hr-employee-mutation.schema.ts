import { z } from "zod";

const nullableTrimmedString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  });

const optionalEntityId = z
  .union([z.string(), z.literal("")])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === "") return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  });

export const hrCreateEmployeeActionSchema = z.object({
  employeeNumber: z.string().trim().min(1).max(64),
  legalName: z.string().trim().min(1).max(256),
  preferredName: nullableTrimmedString,
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  currentDepartmentId: optionalEntityId,
  currentPositionId: optionalEntityId,
  managerEmployeeId: optionalEntityId,
});

export const hrUpdateEmployeeActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  employeeNumber: z.string().trim().min(1).max(64).optional(),
  legalName: z.string().trim().min(1).max(256).optional(),
  preferredName: nullableTrimmedString,
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  currentDepartmentId: optionalEntityId,
  currentPositionId: optionalEntityId,
  managerEmployeeId: optionalEntityId,
});

export const hrArchiveEmployeeActionSchema = z.object({
  employeeId: z.string().trim().min(1),
});
