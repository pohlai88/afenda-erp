type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export const findLeaveEmployeeForUser: (
  ...args: readonly AnyValue[]
) => Promise<LooseRecord | null> = null as AnyValue
export const listActiveEmployeeChoicesForLeave: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly id: string
    readonly employeeNumber: string
    readonly legalName: string
    readonly [key: string]: any
  }[]
> = null as AnyValue
