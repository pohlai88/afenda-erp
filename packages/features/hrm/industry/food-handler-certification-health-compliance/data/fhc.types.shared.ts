export type FhcOutletChoiceRow = {
  readonly id: string
  readonly code: string
  readonly name: string
}

export type FhcRequirementRuleRow = {
  readonly id: string
  readonly outletId: string | null
  readonly outletLabel: string | null
  readonly countryCode: string | null
  readonly legalEntityRef: string | null
  readonly roleRef: string | null
  readonly departmentRef: string | null
  readonly employeeCategoryRef: string | null
  readonly requiresPermit: boolean
  readonly requiresHygieneTraining: boolean
  readonly requiresAllergenTraining: boolean
  readonly requiresHealthCertificate: boolean
  readonly active: boolean
}

export type FhcEmployeeObligationRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly employeeNumber: string | null
  readonly requirementRuleId: string
  readonly outletId: string | null
  readonly outletLabel: string | null
  readonly requiresPermit: boolean
  readonly requiresHygieneTraining: boolean
  readonly requiresAllergenTraining: boolean
  readonly requiresHealthCertificate: boolean
  readonly complianceStatus: string
  readonly computedStatus: string
  readonly computedAt: Date | null
  readonly permitId: string | null
  readonly permitRenewalState: string | null
  readonly healthCertificateId: string | null
  readonly healthRenewalState: string | null
  readonly permitEvidenceCount: number
  readonly healthEvidenceCount: number
}

export type FhcEvidenceDocumentChoiceRow = {
  readonly id: string
  readonly label: string
}

export type FhcHealthRecordRow = {
  readonly id: string
  readonly obligationId: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly healthStatus: string
  readonly renewalState: string
  readonly issuedAt: string | null
  readonly expiresAt: string | null
  readonly certificateRefDisplay: string | null
}

export type FhcDutyRestrictionRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly restrictionScope: string
  readonly effectiveFrom: string
  readonly effectiveTo: string | null
  readonly reason: string | null
}
