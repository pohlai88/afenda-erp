import { hrTimeClockRawPunches } from "./hr-time-clock";

export type HrTimeClockPunchType =
  (typeof hrTimeClockRawPunches.$inferSelect)["punchType"];

export class HrTimeClockCommandError extends Error {
  readonly code:
    | "device_not_found"
    | "device_external_id_conflict"
    | "employee_not_found"
    | "mapping_not_found"
    | "mapping_identity_required"
    | "duplicate_idempotency"
    | "raw_punch_not_found"
    | "punch_not_validated"
    | "punch_not_promotable"
    | "correction_not_allowed";

  constructor(code: HrTimeClockCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}
