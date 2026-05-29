import type {
  HrmSuccessionBusinessImpact,
  HrmSuccessionCalibrationOutcome,
  HrmSuccessionCalibrationSessionStatus,
  HrmSuccessionNominationStatus,
  HrmSuccessionPoolKind,
  HrmSuccessionReadinessLevel,
  HrmSuccessionReplacementStatus,
  HrmSuccessionReviewCycleState,
  HrmSuccessionRiskLevel,
  HrmSuccessionSuccessorType,
  HrmSuccessionVacancyRisk,
} from "../schemas/succession-workflow-state.shared"

export type SuccessionCriticalRoleRow = {
  readonly id: string
  readonly code: string
  readonly title: string
  readonly businessImpact: HrmSuccessionBusinessImpact
  readonly leadershipLevel: string
  readonly vacancyRisk: HrmSuccessionVacancyRisk
  readonly replacementDifficulty: string
  readonly orgUnitId: string | null
  readonly positionId: string | null
  readonly jobFamilyRef: string | null
  readonly gradeRef: string | null
  readonly incumbentEmployeeId: string | null
  readonly incumbentLabel: string | null
  readonly active: boolean
  readonly notes: string | null
}

export type SuccessionNominationRow = {
  readonly id: string
  readonly criticalRoleId: string
  readonly criticalRoleTitle: string
  readonly candidateEmployeeId: string
  readonly candidateLabel: string
  readonly successorType: HrmSuccessionSuccessorType
  readonly readinessLevel: HrmSuccessionReadinessLevel
  readonly potentialRating: string | null
  readonly performancePotentialGrid: string | null
  readonly nominationReason: string | null
  readonly status: HrmSuccessionNominationStatus
}

export type SuccessionDevelopmentLinkRow = {
  readonly id: string
  readonly nominationId: string
  readonly developmentPlanId: string
  readonly linkStatus: string
  readonly progressPercent: number | null
}

export type SuccessionTalentPoolRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly poolKind: HrmSuccessionPoolKind
  readonly description: string | null
  readonly active: boolean
  readonly memberCount: number
}

export type SuccessionPoolMemberRow = {
  readonly id: string
  readonly poolId: string
  readonly employeeId: string
  readonly employeeLabel: string
}

export type SuccessionCalibrationSessionRow = {
  readonly id: string
  readonly title: string
  readonly sessionDate: string | null
  readonly status: HrmSuccessionCalibrationSessionStatus
  readonly notes: string | null
  readonly entryCount: number
}

export type SuccessionCalibrationEntryRow = {
  readonly id: string
  readonly sessionId: string
  readonly nominationId: string | null
  readonly employeeId: string
  readonly employeeLabel: string
  readonly outcome: HrmSuccessionCalibrationOutcome
  readonly comments: string | null
  readonly decisionRef: string | null
  readonly gridCell: string | null
}

export type SuccessionReplacementPlanRow = {
  readonly id: string
  readonly criticalRoleId: string
  readonly criticalRoleTitle: string
  readonly planKind: "emergency" | "planned"
  readonly primaryNominationId: string | null
  readonly interimEmployeeId: string | null
  readonly interimLabel: string | null
  readonly effectiveFrom: string | null
  readonly status: HrmSuccessionReplacementStatus
  readonly notes: string | null
}

export type SuccessionReviewCycleRow = {
  readonly id: string
  readonly title: string
  readonly cycleState: HrmSuccessionReviewCycleState
  readonly dueDate: string | null
  readonly completedAt: Date | null
}

export type SuccessionRiskSnapshotRow = {
  readonly id: string
  readonly criticalRoleId: string
  readonly criticalRoleTitle: string
  readonly benchStrengthScore: number
  readonly readySuccessorCount: number
  readonly riskLevel: HrmSuccessionRiskLevel
  readonly flags: readonly string[]
  readonly computedAt: Date
}

export type SuccessionBenchStrengthRow = {
  readonly criticalRoleId: string
  readonly criticalRoleTitle: string
  readonly leadershipLevel: string
  readonly jobFamilyRef: string | null
  readonly vacancyRisk: HrmSuccessionVacancyRisk
  readonly nominationCount: number
  readonly readyNowCount: number
  readonly benchStrengthScore: number
  readonly riskLevel: HrmSuccessionRiskLevel
  readonly flags: readonly string[]
}

export type SuccessionOrgOverviewSummary = {
  readonly activeCriticalRoles: number
  readonly activeNominations: number
  readonly talentPools: number
  readonly openReviewCycles: number
  readonly rolesWithoutReadySuccessor: number
  readonly highRiskRoles: number
}

export type SuccessionPerformanceRefRow = {
  readonly employeeId: string
  readonly reviewId: string
  readonly cycleName: string
  readonly rating: string | null
  readonly state: string
  readonly finalizedAt: Date | null
}

export type SuccessionCompetencyGapStubRow = {
  readonly employeeId: string
  readonly competencyRef: string
  readonly gapSeverity: "low" | "medium" | "high"
  readonly note: string
}

export type SuccessionLifecycleRecommendation = {
  readonly employeeId: string
  readonly criticalRoleId: string
  readonly criticalRoleTitle: string
  readonly nominationId: string
  readonly successorType: HrmSuccessionSuccessorType
  readonly readinessLevel: HrmSuccessionReadinessLevel
  readonly status: HrmSuccessionNominationStatus
}

export type SuccessionEmployeeChoiceRow = {
  readonly id: string
  readonly label: string
}

export type SuccessionCriticalRoleChoiceRow = {
  readonly id: string
  readonly label: string
}
