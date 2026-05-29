type LooseRecord = { readonly [key: string]: any }
type AnyValue = any

export type HrmTrainingAssignmentRow = LooseRecord
export type HrmTrainingRecord = LooseRecord
export type KpiGoalRow = LooseRecord
export type LmsComplianceMandatoryCompletionRow = {
  readonly employeeId: string
  readonly status: string
  readonly assignmentState?: string | null
  readonly dueAt?: Date | null
  readonly recordCompletedAt?: Date | null
  readonly recordExpiresAt?: Date | null
  readonly [key: string]: any
}

export const HRM_TRAINING_AUDIT: AnyValue = null
export const appendTrainingEvent: AnyValue = null
export const buildEmployeeDetailTrainingAssignmentListSurfaceConfiguration: AnyValue = null
export const buildTrainingRecordListSurfaceConfiguration: AnyValue = null
export const completeBoardingTasksForTrainingRecord: AnyValue = null
export const createTrainingRecordInTransaction: AnyValue = null
export const getLmsComplianceCompletionSnapshot: (
  ...args: readonly AnyValue[]
) => Promise<readonly LmsComplianceMandatoryCompletionRow[]> =
  null as AnyValue
export const getLmsOnboardingCompletionSnapshot: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const grantSkillFromTrainingRecord: AnyValue = null
export const linkTrainingCompletionToComplianceEvidence: AnyValue = null
export const listEmployeeSkillsForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly skillId: string
    readonly skillLabel: string
    readonly proficiency: number
  }[]
> = null as AnyValue
export const listTrainingAssignmentsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly HrmTrainingAssignmentRow[]> = null as AnyValue
export const listTrainingRecordsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly HrmTrainingRecord[]> = null as AnyValue
export const updateTrainingRecordFeedback: AnyValue = null
