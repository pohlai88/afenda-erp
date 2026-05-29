import type { ComponentType } from "react"

type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export const addDaysIso: (...args: readonly AnyValue[]) => string =
  null as AnyValue
export const assignOneShift: AnyValue = null
export const buildSftEmbeddedListSurfaceErrorConfiguration: AnyValue = null
export const compareScheduledVsAttendance: AnyValue = null
export const detectShiftSchedulingConflicts: (
  ...args: readonly AnyValue[]
) => Promise<readonly { readonly kind: string; readonly [key: string]: any }[]> =
  null as AnyValue
export const getOrCreateShiftSchedulingPolicy: AnyValue = null
export const getRemoteCheckinHoursForEmployeeDateRange: AnyValue = null
export const listActiveEmployeeChoicesForSft: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listAllShiftTemplatesForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listSftAttendanceReconcileRowsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listShiftPayrollReferencesForPeriod: (
  ...args: readonly AnyValue[]
) => Promise<LooseRecord[]> = null as AnyValue
export const listVerifiedRemoteCheckinsForEmployeeDate: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly locationVerificationOutcome: string | null
    readonly [key: string]: any
  }[]
> = null as AnyValue
export const scheduledMinutesBetween: (...args: readonly AnyValue[]) => number =
  null as AnyValue
export const SftAvailabilitySection: ComponentType<AnyValue> = null as AnyValue
export const SftSwapPendingSection: ComponentType<AnyValue> = null as AnyValue
export const todayIsoDate: (...args: readonly AnyValue[]) => string =
  null as AnyValue
