export type MscSiteChoiceRow = {
  readonly id: string
  readonly code: string
  readonly name: string
}

export type MscSiteMasterRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly countryCode: string | null
  readonly oshaRecordkeepingEnabled: boolean
}

export type MscMachineRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly siteId: string | null
  readonly siteLabel: string | null
}

export type MscRequirementRuleRow = {
  readonly id: string
  readonly siteId: string | null
  readonly siteLabel: string | null
  readonly machineId: string | null
  readonly workAreaId: string | null
  readonly countryCode: string | null
  readonly legalEntityRef: string | null
  readonly roleRef: string | null
  readonly departmentRef: string | null
  readonly riskCategory: string | null
  readonly requiresMachineSafety: boolean
  readonly requiresPpeTraining: boolean
  readonly requiresPpeAcknowledgment: boolean
  readonly requiresChemicalHandling: boolean
  readonly requiresFireSafety: boolean
  readonly requiresErgonomics: boolean
  readonly requiresWorkplaceHazard: boolean
  readonly requiresSafetyCertification: boolean
  readonly active: boolean
}

export type MscEmployeeObligationRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly employeeNumber: string | null
  readonly requirementRuleId: string
  readonly siteId: string | null
  readonly siteLabel: string | null
  readonly complianceStatus: string
  readonly computedStatus: string
  readonly computedAt: Date | null
  readonly certificationId: string | null
  readonly certExpiryDate: string | null
}

export type MscCertificationRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly certificationType: string
  readonly certStatus: string
  readonly issueDate: string | null
  readonly expiryDate: string | null
  readonly renewalDate: string | null
}

export type MscHazardAssessmentRow = {
  readonly id: string
  readonly title: string
  readonly assessmentType: string
  readonly assessmentStatus: string
  readonly siteLabel: string | null
  readonly expiresAt: string | null
}

export type MscIncidentRow = {
  readonly id: string
  readonly incidentDate: string
  readonly incidentType: string
  readonly incidentStatus: string
  readonly severity: string | null
  readonly siteLabel: string | null
  readonly employeeLabel: string | null
}

export type MscCorrectiveActionRow = {
  readonly id: string
  readonly title: string
  readonly sourceKind: string
  readonly priority: string
  readonly actionStatus: string
  readonly dueDate: string | null
  readonly ownerUserId: string | null
}

export type MscWorkRestrictionRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLabel: string
  readonly restrictionScope: string
  readonly effectiveFrom: string
  readonly effectiveTo: string | null
  readonly reason: string | null
}

export type MscRegulatoryReferenceRow = {
  readonly id: string
  readonly framework: string
  readonly referenceCode: string | null
  readonly referenceLabel: string | null
  readonly siteLabel: string | null
  readonly notes: string | null
}
