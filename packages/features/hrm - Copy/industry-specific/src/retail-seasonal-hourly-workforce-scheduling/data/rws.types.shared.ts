import type {
  HrmRwsClaimMode,
  HrmRwsDemandReferenceKind,
  HrmRwsOpenShiftStatus,
  HrmRwsPeriodKind,
  HrmRwsPeriodState,
  HrmRwsRetailRole,
} from "../schemas/rws-workflow-state.shared"

export type RwsStoreRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly branchRef: string | null
  readonly departmentRef: string | null
  readonly legalEntityRef: string | null
  readonly locationRef: string | null
  readonly active: boolean
}

export type RwsStoreChoiceRow = {
  readonly id: string
  readonly label: string
}

export type RwsSchedulePeriodRow = {
  readonly id: string
  readonly storeId: string
  readonly storeLabel: string
  readonly code: string
  readonly name: string
  readonly periodKind: HrmRwsPeriodKind
  readonly state: HrmRwsPeriodState
  readonly periodStartDate: string
  readonly periodEndDate: string
  readonly campaignLabel: string | null
  readonly publishedAt: Date | null
}

export type RwsCoverageSlotRow = {
  readonly id: string
  readonly schedulePeriodId: string
  readonly storeId: string
  readonly slotDate: string
  readonly hourOfDay: number
  readonly retailRole: HrmRwsRetailRole
  readonly requiredHeadcount: number
  readonly departmentRef: string | null
}

export type RwsCoverageGapRow = {
  readonly coverageSlotId: string
  readonly slotDate: string
  readonly hourOfDay: number
  readonly retailRole: HrmRwsRetailRole
  readonly requiredHeadcount: number
  readonly scheduledHeadcount: number
  readonly gap: number
  readonly status: "understaffed" | "overstaffed" | "balanced"
}

export type RwsOpenShiftOfferRow = {
  readonly id: string
  readonly schedulePeriodId: string
  readonly storeId: string
  readonly storeLabel: string
  readonly slotDate: string
  readonly retailRole: HrmRwsRetailRole
  readonly claimMode: HrmRwsClaimMode
  readonly status: HrmRwsOpenShiftStatus
  readonly claimedByEmployeeId: string | null
  readonly shiftAssignmentId: string | null
}

export type RwsLaborDemandReferenceRow = {
  readonly id: string
  readonly schedulePeriodId: string
  readonly storeId: string
  readonly storeLabel: string
  readonly referenceKind: HrmRwsDemandReferenceKind
  readonly externalRef: string | null
  readonly notes: string | null
  readonly createdAt: Date
}

export type RwsLaborBudgetSnapshotRow = {
  readonly id: string
  readonly schedulePeriodId: string
  readonly storeId: string
  readonly storeLabel: string
  readonly approvedBudgetAmount: string
  readonly currencyCode: string | null
  readonly notes: string | null
}

export type RwsRetailSchedulingPolicyRow = {
  readonly id: string
  readonly maxDailyHours: number | null
  readonly maxWeeklyHours: number | null
  readonly minRestHours: number | null
  readonly mealBreakMinutes: number | null
  readonly restBreakMinutes: number | null
  readonly minorMaxDailyHours: number | null
  readonly minorMaxWeeklyHours: number | null
  readonly studentMaxWeeklyHours: number | null
  readonly peakSeasonEnabled: boolean
  readonly holidayRuleEnabled: boolean
  readonly weekendRuleEnabled: boolean
  readonly lateNightRuleEnabled: boolean
}

export type RwsOrgOverviewSummary = {
  readonly activeStores: number
  readonly draftPeriods: number
  readonly publishedPeriods: number
  readonly openShiftOffers: number
  readonly understaffedSlots: number
}

export type RwsLaborMetricsSummary = {
  readonly scheduledMinutes: number
  readonly scheduledCostAmount: string | null
  readonly approvedBudgetAmount: string | null
  readonly budgetVarianceAmount: string | null
  readonly overtimeRiskCount: number
}

export type RwsPublishGuardIssue = {
  readonly code: string
  readonly message: string
  readonly severity: "error" | "warning"
}
