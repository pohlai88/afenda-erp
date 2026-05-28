import type {
  HrmUcbCbaStatus,
  HrmUcbGrievanceStatus,
  HrmUcbRuleDomain,
  HrmUcbUnionStatus,
} from "../schemas/ucb-workflow-state.shared"

export type UcbChoiceRow = { id: string; label: string }

export type UcbUnionRow = {
  id: string
  code: string
  name: string
  status: HrmUcbUnionStatus
  representativeRef: string | null
  notes: string | null
}

export type UcbCollectiveAgreementRow = {
  id: string
  unionId: string
  unionLabel: string
  bargainingUnitId: string | null
  bargainingUnitLabel: string | null
  title: string
  versionLabel: string
  effectiveFrom: string | null
  effectiveTo: string | null
  status: HrmUcbCbaStatus
  negotiationStatus: string
}

export type UcbMembershipRow = {
  id: string
  employeeId: string
  employeeLabel: string
  unionId: string
  unionLabel: string
  bargainingUnitId: string | null
  bargainingUnitLabel: string | null
  status: string
  membershipStartDate: string | null
  membershipEndDate: string | null
}

export type UcbCbaRuleRow = {
  id: string
  collectiveAgreementId: string
  agreementTitle: string
  ruleDomain: HrmUcbRuleDomain
  externalRuleCode: string
  summary: string
  active: boolean
}

export type UcbSeniorityProfileRow = {
  id: string
  membershipId: string
  employeeId: string
  employeeLabel: string
  seniorityDate: string
  computedRank: number | null
}

export type UcbComplianceFindingRow = {
  id: string
  findingCode: string
  severity: string
  message: string
  employeeId: string | null
  employeeLabel: string | null
  agreementTitle: string | null
  resolvedAt: string | null
}

export type UcbDuesReferenceRow = {
  id: string
  membershipId: string
  employeeId: string
  employeeLabel: string
  amountRef: string
  currencyCode: string
  approvalState: string
  effectiveFrom: string | null
}

export type UcbGrievanceRow = {
  id: string
  employeeId: string
  employeeLabel: string
  category: string
  clauseCode: string | null
  severity: string
  status: HrmUcbGrievanceStatus
  summary: string
  agreementTitle: string | null
  mediationRef: string | null
  arbitrationRef: string | null
  legalMatterRef: string | null
}

export type UcbRepresentativeRow = {
  id: string
  unionId: string
  unionLabel: string
  employeeLabel: string | null
  roleKind: string
  departmentRef: string | null
  siteRef: string | null
  active: boolean
}

export type UcbLrMeetingRow = {
  id: string
  title: string
  scheduledAt: string | null
  status: string
  participantCount: number
  actionItemCount: number
}

export type UcbOrgOverviewSummary = {
  activeUnions: number
  activeAgreements: number
  activeMemberships: number
  openGrievances: number
  expiringAgreements: number
  unresolvedComplianceFindings: number
}

export type UcbRuleRefExportRow = {
  ruleId: string
  collectiveAgreementId: string
  externalRuleCode: string
  summary: string
  ruleDomain: HrmUcbRuleDomain
}

export type UcbSeniorityPriorityRow = {
  employeeId: string
  employeeLabel: string
  seniorityDate: string
  rank: number
}

export type UcbApprovedDuesPayrollRow = {
  duesReferenceId: string
  membershipId: string
  employeeId: string
  amountRef: string
  currencyCode: string
  effectiveFrom: string | null
}

export type UcbMutationFormState =
  | { ok: true; id?: string }
  | { ok: false; form?: string }
