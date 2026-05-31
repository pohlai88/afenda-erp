export type HrSftNotificationKind =
  | "roster_published"
  | "roster_changed"
  | "assignment_changed";

export type HrSftNotificationTemplateInput = {
  kind: HrSftNotificationKind;
  employeeDisplayName?: string;
  periodStart?: Date;
  periodEnd?: Date;
  templateCode?: string;
  shiftDate?: Date;
  detail?: string;
};

function formatDate(date: Date | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/** HRM-SFT-025 — SFT-specific notification copy for org in-app and email delivery. */
export function buildHrSftNotificationCopy(
  input: HrSftNotificationTemplateInput,
): { title: string; body: string } {
  const detail = input.detail ? ` ${input.detail}` : "";
  const employee = input.employeeDisplayName ?? "You";
  const period =
    input.periodStart && input.periodEnd
      ? `${formatDate(input.periodStart)} to ${formatDate(input.periodEnd)}`
      : null;

  switch (input.kind) {
    case "roster_published":
      return {
        title: "Shift roster published",
        body: period
          ? `The shift roster for ${period} has been published.${detail}`
          : `Your shift roster has been published.${detail}`,
      };
    case "roster_changed":
      return {
        title: "Shift schedule changed",
        body: period
          ? `The shift schedule for ${period} was updated.${detail}`
          : `Your shift schedule was updated.${detail}`,
      };
    case "assignment_changed":
      return {
        title: "Shift assignment updated",
        body: input.shiftDate
          ? `${employee} has a shift change on ${formatDate(input.shiftDate)}${input.templateCode ? ` (${input.templateCode})` : ""}.${detail}`
          : `${employee} has an updated shift assignment.${detail}`,
      };
    default:
      return {
        title: "Shift scheduling update",
        body: `There is an update to the shift schedule.${detail}`,
      };
  }
}

export const hrSftNotificationSubjectTypes = {
  rosterPublication: "hr_sft_roster_publication",
  assignment: "hr_sft_assignment",
} as const;
