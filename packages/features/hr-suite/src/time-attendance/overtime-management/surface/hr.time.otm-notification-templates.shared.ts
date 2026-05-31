export type HrTimeOtmNotificationKind =
  | "request_submitted"
  | "request_approved"
  | "request_rejected"
  | "request_returned"
  | "request_cancelled"
  | "request_overdue"
  | "payroll_ready";

export type HrTimeOtmNotificationTemplateInput = {
  kind: HrTimeOtmNotificationKind;
  employeeDisplayName?: string;
  workDate?: Date;
  detail?: string;
};

function formatWorkDate(date: Date | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/** HRM-OTM-026 — OTM notification copy for in-app, email, and realtime delivery. */
export function buildHrTimeOtmNotificationCopy(
  input: HrTimeOtmNotificationTemplateInput,
): { title: string; body: string } {
  const detail = input.detail ? ` ${input.detail}` : "";
  const employee = input.employeeDisplayName ?? "An employee";
  const workDate = formatWorkDate(input.workDate);

  switch (input.kind) {
    case "request_submitted":
      return {
        title: "Overtime request submitted",
        body: workDate
          ? `${employee} submitted overtime for ${workDate}.${detail}`
          : `${employee} submitted an overtime request.${detail}`,
      };
    case "request_approved":
      return {
        title: "Overtime request approved",
        body: workDate
          ? `Overtime for ${workDate} was approved.${detail}`
          : `An overtime request was approved.${detail}`,
      };
    case "request_rejected":
      return {
        title: "Overtime request rejected",
        body: workDate
          ? `Overtime for ${workDate} was rejected.${detail}`
          : `An overtime request was rejected.${detail}`,
      };
    case "request_returned":
      return {
        title: "Overtime request returned",
        body: workDate
          ? `Overtime for ${workDate} was returned for revision.${detail}`
          : `An overtime request was returned for revision.${detail}`,
      };
    case "request_cancelled":
      return {
        title: "Overtime request cancelled",
        body: workDate
          ? `Overtime for ${workDate} was cancelled.${detail}`
          : `An overtime request was cancelled.${detail}`,
      };
    case "request_overdue":
      return {
        title: "Overtime approval overdue",
        body: workDate
          ? `${employee} overtime for ${workDate} is awaiting approval.${detail}`
          : `${employee} has an overtime request awaiting approval.${detail}`,
      };
    case "payroll_ready":
      return {
        title: "Overtime payroll ready",
        body: workDate
          ? `Approved overtime for ${workDate} is payroll ready.${detail}`
          : `Approved overtime is payroll ready.${detail}`,
      };
    default:
      return {
        title: "Overtime update",
        body: `There is an update to an overtime request.${detail}`,
      };
  }
}

export const hrTimeOtmNotificationSubjectTypes = {
  request: "hr_overtime_request",
} as const;

export function buildHrTimeOtmModulePath(orgSlug: string, locale: string): string {
  return `/${locale}/o/${orgSlug}/apps/hrm/overtime`;
}
