type LooseRecord = { readonly [key: string]: any }
type AnyValue = any

export type LeaveTypeChoiceRow = AnyValue

export const applyAttendanceEventCorrection: AnyValue = null
export const buildAttendancePortalDaysListSurfaceConfiguration: AnyValue = null
export const buildLeaveBalanceListSurfaceConfiguration: AnyValue = null
export const buildLeaveMyHistoryListSurfaceConfiguration: AnyValue = null
export const cancelLeaveRequestForContext: AnyValue = null
export const listActiveLeaveTypesForOrg: AnyValue = null
export const listAttendanceDaysForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly id: string
    readonly attendanceDate: string
    readonly workedMinutes: number | null
    readonly state: string
  }[]
> = null as AnyValue
export const listAttendanceEventsForDate: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly id: string
    readonly eventType: string
    readonly occurredAt: Date
    readonly correctionOfEventId: string | null
    readonly [key: string]: any
  }[]
> = null as AnyValue
export const listLeaveBalancesForEmployee: AnyValue = null
export const listLeaveRequestsForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly id: string
    readonly state: string
    readonly leaveTypeCode: string | null
    readonly requestedAt: Date
    readonly [key: string]: any
  }[]
> = null as AnyValue
export const submitLeaveRequest: AnyValue = null
