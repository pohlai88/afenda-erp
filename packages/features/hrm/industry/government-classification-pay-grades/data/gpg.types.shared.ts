import type {
  HrmGpgAdjustmentType,
  HrmGpgAppointmentType,
  HrmGpgClassificationScheme,
  HrmGpgLocalityType,
  HrmGpgMasterState,
  HrmGpgMovementState,
  HrmGpgMovementType,
  HrmGpgReclassificationState,
  HrmGpgSalaryTableVersionState,
  HrmGpgStepIncreaseEventState,
} from "../schemas/gpg-workflow-state.shared"

export type GpgClassificationRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly scheme: HrmGpgClassificationScheme
  readonly occupationalGroup: string | null
  readonly jobSeries: string | null
  readonly jobFamily: string | null
  readonly agencyRef: string | null
  readonly departmentRef: string | null
  readonly positionRef: string | null
  readonly state: HrmGpgMasterState
  readonly effectiveDate: string
}

export type GpgClassificationChoiceRow = {
  readonly id: string
  readonly label: string
}

export type GpgPayGradeRow = {
  readonly id: string
  readonly classificationId: string
  readonly classificationLabel: string
  readonly code: string
  readonly name: string
  readonly gsEquivalent: string | null
  readonly sesEquivalent: string | null
  readonly civilServiceGradeRef: string | null
  readonly rankEquivalent: string | null
  readonly state: HrmGpgMasterState
  readonly effectiveDate: string
}

export type GpgPayGradeChoiceRow = {
  readonly id: string
  readonly label: string
}

export type GpgPayBandRow = {
  readonly id: string
  readonly payGradeId: string
  readonly payGradeLabel: string
  readonly code: string
  readonly name: string
  readonly minRate: string | null
  readonly maxRate: string | null
  readonly currencyCode: string | null
  readonly state: HrmGpgMasterState
  readonly effectiveDate: string
}

export type GpgSalaryTableVersionRow = {
  readonly id: string
  readonly code: string
  readonly versionNumber: number
  readonly effectiveDate: string
  readonly state: HrmGpgSalaryTableVersionState
  readonly rowCount: number
}

export type GpgSalaryTableRowRow = {
  readonly id: string
  readonly tableVersionId: string
  readonly payGradeId: string
  readonly payGradeLabel: string
  readonly step: number
  readonly baseRate: string
  readonly minRate: string | null
  readonly maxRate: string | null
  readonly currencyCode: string | null
}

export type GpgSalaryTableVersionChoiceRow = {
  readonly id: string
  readonly label: string
}

export type GpgEmployeeChoiceRow = {
  readonly id: string
  readonly label: string
}

export type GpgAssignmentHistoryRow = {
  readonly id: string
  readonly assignmentId: string
  readonly employeeId: string | null
  readonly employeeLabel: string
  readonly asOfDate: string
  readonly classificationLabel: string
  readonly payGradeLabel: string
  readonly step: number
  readonly salaryTableVersionId: string | null
}

export type GpgEmployeeAssignmentRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly classificationLabel: string
  readonly payGradeLabel: string
  readonly payBandLabel: string | null
  readonly step: number
  readonly appointmentType: HrmGpgAppointmentType
  readonly effectiveFrom: string
  readonly effectiveTo: string | null
  readonly state: "draft" | "active" | "ended" | "cancelled"
  readonly baseRate: string | null
  readonly adjustedPayReference: string | null
  readonly currencyCode: string | null
}

export type GpgLocalityRuleRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly localityType: HrmGpgLocalityType
  readonly areaRef: string | null
  readonly regionCode: string | null
  readonly countryCode: string | null
  readonly city: string | null
  readonly dutyStationRef: string | null
  readonly adjustmentPercent: string | null
  readonly state: HrmGpgMasterState
  readonly effectiveDate: string
}

export type GpgAdjustmentReferenceRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly adjustmentType: HrmGpgAdjustmentType
  readonly localityRuleId: string | null
  readonly localityRuleLabel: string | null
  readonly amount: string | null
  readonly percent: string | null
  readonly effectiveDate: string
}

export type GpgStepIncreaseRuleRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly waitingPeriodMonths: number
  readonly requiresApproval: boolean
  readonly minManagerRating: number | null
  readonly state: HrmGpgMasterState
}

export type GpgStepIncreaseRuleChoiceRow = {
  readonly id: string
  readonly label: string
}

export type GpgStepEligibleRow = {
  readonly assignmentId: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly payGradeLabel: string
  readonly step: number
  readonly nextStep: number
  readonly effectiveFrom: string
  readonly eligibilityDate: string
  readonly ruleId: string
  readonly ruleCode: string
  readonly daysUntilEligible: number
  readonly managerRating: string | null
  readonly performanceGateMet: boolean
}

export type GpgStepIncreaseEventRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly ruleCode: string
  readonly payGradeLabel: string
  readonly fromStep: number
  readonly toStep: number
  readonly eligibilityDate: string | null
  readonly state: HrmGpgStepIncreaseEventState
  readonly requiresApproval: boolean
}

export type GpgStepIncreaseSummary = {
  readonly eligibleCount: number
  readonly pendingApprovalCount: number
  readonly activeRuleCount: number
}

export type GpgGradeMovementRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly movementType: HrmGpgMovementType
  readonly fromPayGradeLabel: string | null
  readonly toPayGradeLabel: string | null
  readonly fromStep: number | null
  readonly toStep: number | null
  readonly effectiveDate: string
  readonly retentionAmount: string | null
  readonly reason: string | null
  readonly state: HrmGpgMovementState
}

export type GpgActiveAssignmentChoiceRow = {
  readonly employeeId: string
  readonly employeeLabel: string
  readonly assignmentId: string
  readonly classificationId: string
  readonly payGradeId: string
  readonly step: number
}

export type GpgReclassificationRequestRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly fromClassificationLabel: string | null
  readonly toClassificationLabel: string | null
  readonly state: HrmGpgReclassificationState
  readonly reason: string | null
}

export type GpgOrgOverviewSummary = {
  readonly activeAssignments: number
  readonly distinctPayGrades: number
  readonly activeLocalityRules: number
  readonly pendingStepEvents: number
  readonly appliedMovements: number
}
