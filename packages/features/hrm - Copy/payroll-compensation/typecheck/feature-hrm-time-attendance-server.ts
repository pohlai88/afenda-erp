type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export type AttendanceDayRow = {
  readonly state: string
  readonly calculationSnapshot: unknown
  readonly scheduledMinutes: number
  readonly overtimeMinutes: number
  readonly [key: string]: any
}
export type LeaveEmployeeChoiceRow = {
  readonly id: string
  readonly employeeNumber: string
  readonly legalName: string
  readonly [key: string]: any
}

export const isAttendanceDayReadyForPayroll: AnyValue = null
export const listActiveEmployeeChoicesForLeave: (
  ...args: readonly AnyValue[]
) => Promise<readonly LeaveEmployeeChoiceRow[]> = null as AnyValue
export const listAttendanceDaysForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<readonly AttendanceDayRow[]> = null as AnyValue
export const listAttendanceDaysForPayroll: (
  ...args: readonly AnyValue[]
) => Promise<readonly AttendanceDayRow[]> = null as AnyValue
export const listOtmPayrollEarningsForEmployeePeriod: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly overtimeRequestId: string
    readonly payrollLineCode: string
    readonly description: string
    readonly amount: string
    readonly currency: string
    readonly payableMinutes: number
  }[]
> = null as AnyValue
export const markOtmRequestsPaidForPayrollPeriod: AnyValue = null
