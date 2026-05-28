import type { EngagementAnswerValue } from "./engagement-response.shared"
import type { EngagementSurveyQuestionRow } from "./engagement-query.shared"
import type {
  HrmEngagementAnonymityMode,
  HrmEngagementSurveyState,
} from "./engagement-workflow.shared"

/** Serializable employee respond surface (RSC → client). */
export type EngagementRespondPageData = {
  invitationId: string
  surveyId: string
  surveyTitle: string
  surveyState: HrmEngagementSurveyState
  anonymityMode: HrmEngagementAnonymityMode
  openAt: string | null
  closeAt: string | null
  invitationState: string
  responseState: "draft" | "submitted" | null
  questions: readonly EngagementSurveyQuestionRow[]
  answersByQuestionId: Readonly<Record<string, EngagementAnswerValue>>
  windowOpen: boolean
  allowDraftResponses: boolean
}
