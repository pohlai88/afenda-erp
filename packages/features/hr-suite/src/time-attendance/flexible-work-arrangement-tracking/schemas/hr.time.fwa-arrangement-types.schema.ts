import { z } from "zod";

/** Mirrors `hr_fwa_arrangement_kind` — HRM-FWA-002. */
export const hrFwaArrangementKindSchema = z.enum([
  "hybrid",
  "remote",
  "compressed_week",
  "flexible_hours",
  "staggered_hours",
  "part_time",
  "temporary",
]);

export type HrFwaArrangementKindInput = z.infer<
  typeof hrFwaArrangementKindSchema
>;

export const HR_FWA_ARRANGEMENT_KIND_LABELS: Record<
  HrFwaArrangementKindInput,
  string
> = {
  hybrid: "Hybrid work",
  remote: "Remote work",
  compressed_week: "Compressed work week",
  flexible_hours: "Flexible working hours",
  staggered_hours: "Staggered working hours",
  part_time: "Part-time schedule",
  temporary: "Temporary arrangement",
};

export function formatHrFwaArrangementKindLabel(
  value: HrFwaArrangementKindInput,
): string {
  return HR_FWA_ARRANGEMENT_KIND_LABELS[value];
}
