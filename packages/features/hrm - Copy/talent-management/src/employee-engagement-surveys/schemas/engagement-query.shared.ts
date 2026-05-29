import type {
  HrmEngagementAnonymityMode,
  HrmEngagementCategory,
  HrmEngagementQuestionType,
  HrmEngagementSurveyState,
  HrmEngagementSurveyType,
  HrmEngagementTemplateState,
} from "./engagement-workflow.shared"

export type EngagementTemplateListRow = {
  id: string
  code: string
  name: string
  state: HrmEngagementTemplateState
  questionCount: number
  updatedAt: Date
}

export type EngagementDraftSurveyListRow = {
  id: string
  title: string
  surveyType: HrmEngagementSurveyType
  state: HrmEngagementSurveyState
  templateCode: string | null
  questionCount: number
  updatedAt: Date
}

export type EngagementConfigurableSurveyListRow = {
  id: string
  title: string
  surveyType: HrmEngagementSurveyType
  state: HrmEngagementSurveyState
  anonymityMode: HrmEngagementAnonymityMode
  resolvedAudienceCount: number | null
  openAt: Date | null
  closeAt: Date | null
  questionCount: number
  updatedAt: Date
}

export type EngagementTemplateOption = {
  id: string
  code: string
  name: string
}

export type EngagementTemplateQuestionListRow = {
  id: string
  templateId: string
  templateCode: string
  templateName: string
  sortOrder: number
  questionType: HrmEngagementQuestionType
  category: HrmEngagementCategory
  prompt: string
}

/** HRM-ENG-017 — admin completion row (no answer payload). */
export type EngagementCompletionTrackingRow = {
  invitationId: string
  employeeId: string
  participantLabel: string
  invitationState: "pending" | "submitted" | "expired"
  responseState: "draft" | "submitted" | null
  invitedAt: Date
  submittedAt: Date | null
}

export type EngagementDistributionSummary = {
  invitedCount: number
  submittedCount: number
  draftCount: number
  pendingCount: number
  responseRatePercent: number
}

export type EngagementSurveyQuestionRow = {
  id: string
  sortOrder: number
  questionType: HrmEngagementQuestionType
  category: HrmEngagementCategory
  prompt: string
  config: unknown
}

/** HRM-ENG-025–027 — improvement action list row (no survey answer payloads). */
export type EngagementImprovementActionListRow = {
  id: string
  title: string
  ownerLabel: string | null
  dueDate: string | null
  priority: string | null
  status: "open" | "in_progress" | "completed" | "cancelled"
  category: string | null
  isOverdue: boolean
  updatedAt: Date
}

export type EngagementImprovementOwnerOption = {
  id: string
  label: string
}
