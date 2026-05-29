type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export const listSkillsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listTrainingCoursesForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
