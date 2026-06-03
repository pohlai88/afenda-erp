import {
  classifyHrTimeClockPunchSequence,
  classifyHrTimeClockPunchType as classifyHrTimeClockIngestPunchType,
  type HrTimeClockPunchType,
} from "@afenda/db";

export {
  classifyHrTimeClockPunchSequence,
  classifyHrTimeClockIngestPunchType,
};
export type { HrTimeClockPunchType };

/** HRM-TCI-016 — device alias classification then sequence refinement. */
export function classifyHrTimeClockPunch(input: {
  punchType?: string | null;
  breaksEnabled: boolean;
  previousPunchType?: HrTimeClockPunchType | null;
}): HrTimeClockPunchType {
  const fromDevice = classifyHrTimeClockIngestPunchType({
    punchType: input.punchType,
    breaksEnabled: input.breaksEnabled,
  });

  return classifyHrTimeClockPunchSequence({
    reportedType: fromDevice,
    previousPunchType: input.previousPunchType ?? null,
    breaksEnabled: input.breaksEnabled,
  });
}
