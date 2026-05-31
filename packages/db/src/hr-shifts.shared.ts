export {
  clampPageSize,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "./list-window.shared";

export const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class HrShiftCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "template_not_found"
    | "template_not_active"
    | "template_code_exists"
    | "assignment_not_found"
    | "assignment_not_scheduled"
    | "assignment_date_conflict"
    | "invalid_time_format"
    | "recurrence_not_found"
    | "recurrence_not_active"
    | "recurrence_code_exists"
    | "recurrence_days_required"
    | "recurrence_employee_required"
    | "rotation_not_found"
    | "rotation_not_active"
    | "rotation_code_exists"
    | "rotation_cycle_length_invalid"
    | "rotation_steps_required";

  constructor(code: HrShiftCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export function assertValidTime(value: string): void {
  if (!TIME_PATTERN.test(value)) {
    throw new HrShiftCommandError("invalid_time_format");
  }
}

export function toUtcDayStart(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export function combineDateAndTime(shiftDate: Date, timeHm: string): Date {
  assertValidTime(timeHm);
  const [hoursPart, minutesPart] = timeHm.split(":");
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  const combined = toUtcDayStart(shiftDate);
  combined.setUTCHours(hours, minutes, 0, 0);
  return combined;
}

export function resolveShiftBounds(input: {
  shiftDate: Date;
  startTime: string;
  endTime: string;
}): { shiftStart: Date; shiftEnd: Date } {
  const shiftStart = combineDateAndTime(input.shiftDate, input.startTime);
  let shiftEnd = combineDateAndTime(input.shiftDate, input.endTime);
  if (shiftEnd.getTime() <= shiftStart.getTime()) {
    shiftEnd = new Date(shiftEnd.getTime() + 86_400_000);
  }
  return { shiftStart, shiftEnd };
}

/** HRM-SFT-002 — derive working minutes from clock times and optional break window. */
export function computeHrShiftWorkingMinutes(input: {
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}): number {
  assertValidTime(input.startTime);
  assertValidTime(input.endTime);

  const anchor = new Date("2026-01-01T00:00:00.000Z");
  const start = combineDateAndTime(anchor, input.startTime);
  let end = combineDateAndTime(anchor, input.endTime);
  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 86_400_000);
  }

  let minutes = Math.round((end.getTime() - start.getTime()) / 60_000);

  if (input.breakStartTime && input.breakEndTime) {
    assertValidTime(input.breakStartTime);
    assertValidTime(input.breakEndTime);
    const breakStart = combineDateAndTime(anchor, input.breakStartTime);
    let breakEnd = combineDateAndTime(anchor, input.breakEndTime);
    if (breakEnd.getTime() <= breakStart.getTime()) {
      breakEnd = new Date(breakEnd.getTime() + 86_400_000);
    }
    minutes -= Math.max(
      0,
      Math.round((breakEnd.getTime() - breakStart.getTime()) / 60_000),
    );
  }

  return Math.max(15, Math.min(24 * 60, minutes));
}
