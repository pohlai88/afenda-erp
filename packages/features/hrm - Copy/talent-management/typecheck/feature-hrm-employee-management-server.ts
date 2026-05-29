type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export const completeBoardingTasksForLmsCourseCompletion: AnyValue = null
export const createEmployeeMutation: AnyValue = null
export const listDepartmentsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listEmployeesForOrganization: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly id: string
    readonly employeeNumber: string
    readonly legalName: string
    readonly [key: string]: any
  }[]
> = null as AnyValue
export const listJobGradesForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const transitionBoardingTask: AnyValue = null
