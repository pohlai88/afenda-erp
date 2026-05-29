type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export const listClosedPayrollPeriodsOverlappingRange: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listLegalEntityPayrollConfigs: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly payrollCountryCode: string | null
    readonly countryCode: string | null
    readonly [key: string]: any
  }[]
> = null as AnyValue
export const resolveRulePack: (
  ...args: readonly AnyValue[]
) => {
  readonly version: string
  readonly publicHolidays: (
    year: number,
    observed: readonly AnyValue[]
  ) => readonly { readonly date: string; readonly nameKey: string }[]
} = null as AnyValue
