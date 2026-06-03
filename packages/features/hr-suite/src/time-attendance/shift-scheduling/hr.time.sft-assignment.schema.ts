import { z } from "zod";

/** HRM-SFT-005 — single shift assignment. */
export const hrSftAssignShiftSchema = z.object({
  employeeId: z.string().trim().min(1),
  templateId: z.string().trim().min(1),
  shiftDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional(),
});

export type HrSftAssignShiftInput = z.infer<typeof hrSftAssignShiftSchema>;

/** HRM-SFT-006 — bulk assignment for the same template. */
export const hrSftBulkAssignShiftSchema = z.object({
  templateId: z.string().trim().min(1),
  entries: z
    .array(
      z.object({
        employeeId: z.string().trim().min(1),
        shiftDate: z.coerce.date(),
        notes: z.string().trim().max(500).optional(),
      }),
    )
    .min(1, "At least one assignment entry is required")
    .max(500, "Bulk assignment is limited to 500 rows per request"),
});

export type HrSftBulkAssignShiftInput = z.infer<typeof hrSftBulkAssignShiftSchema>;

export const hrSftArchiveShiftTemplateSchema = z.object({
  templateId: z.string().trim().min(1),
});
