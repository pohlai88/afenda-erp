import type { AppCapability } from "@afenda/auth";

/** HR capabilities registered in @afenda/auth appCapabilities. */
export const HR_CAPABILITIES = [
  "hr.view",
  "hr.employees.write",
  "hr.documents.read",
  "hr.documents.write",
  "hr.lifecycle.read",
  "hr.lifecycle.write",
  "hr.offboarding.read",
  "hr.offboarding.write",
  "hr.compliance.read",
  "hr.compliance.write",
  "hr.leave.read",
  "hr.leave.write",
  "hr.onboarding.read",
  "hr.onboarding.write",
  "hr.attendance.read",
  "hr.attendance.write",
  "hr.overtime.read",
  "hr.overtime.write",
  "hr.shifts.read",
  "hr.shifts.write",
] as const satisfies readonly AppCapability[];

export type HrCapability = (typeof HR_CAPABILITIES)[number];

export function isHrCapability(value: string): value is HrCapability {
  return (HR_CAPABILITIES as readonly string[]).includes(value);
}
