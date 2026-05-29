import type {
  EngagementAudienceFilter,
  EngagementAudienceSnapshot,
} from "./engagement-audience.shared"
import type { EngagementReminderSchedule } from "./engagement-reminder.shared"
import type {
  HrmEngagementAnonymityMode,
  HrmEngagementSurveyState,
  HrmEngagementSurveyType,
} from "./engagement-workflow.shared"

/** Serializable survey configuration for RSC → client forms (HRM-ENG-006–011). */
export type EngagementSurveyConfigurationDetail = {
  id: string
  title: string
  surveyType: HrmEngagementSurveyType
  state: HrmEngagementSurveyState
  anonymityMode: HrmEngagementAnonymityMode
  minSegmentResponses: number | null
  allowDraftResponses: boolean
  cycleId: string | null
  audienceFilter: EngagementAudienceFilter
  audienceSnapshot: EngagementAudienceSnapshot | null
  openAt: Date | null
  closeAt: Date | null
  reminderSchedule: EngagementReminderSchedule | null
  questionCount: number
}

export type EngagementAudienceFilterOptions = {
  readonly departments: ReadonlyArray<{
    id: string
    code: string
    name: string
  }>
  readonly jobGrades: ReadonlyArray<{ id: string; code: string; name: string }>
  readonly managers: ReadonlyArray<{
    id: string
    employeeNumber: string
    legalName: string
  }>
  readonly legalEntityCodes: readonly string[]
  readonly workLocationCodes: readonly string[]
  readonly employmentTypes: readonly string[]
  readonly workerCategories: readonly string[]
}
