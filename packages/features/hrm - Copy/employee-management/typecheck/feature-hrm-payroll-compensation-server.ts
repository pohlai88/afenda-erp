type LooseRecord = { readonly [key: string]: any }
type AnyValue = any

export type BenefitEnrollmentListRow = LooseRecord
export type ClaimEvidenceRow = LooseRecord
export type ClaimListStateLabels = LooseRecord
export type ClaimRow = LooseRecord
export type PayrollPayslipSnapshot = {
  readonly currency: string
  readonly periodStart: string
  readonly periodEnd: string
  readonly lines: readonly {
    readonly lineKind: string
    readonly code: string
    readonly description: string
    readonly amount: string
  }[]
  readonly [key: string]: any
}
export type PayrollPeriodRow = {
  readonly id: string
  readonly state: string
  readonly periodStart: string
  readonly periodEnd: string
  readonly rulePackVersion: string | null
  readonly [key: string]: any
}
export type PayrollRulePack = LooseRecord
export type SalaryAdvanceListRow = {
  readonly id: string
  readonly state: string
  readonly currency: string
  readonly [key: string]: any
}
export type StatutoryPackType =
  | "epf_monthly"
  | "socso_monthly"
  | "eis_monthly"
  | "pcb_monthly"
  | "hrdf_monthly"
  | "ea_annual"
  | "borang_e_annual"
export type StatutoryPackPayload = {
  readonly packType: StatutoryPackType
  readonly [key: string]: any
}

export const attachClaimEvidenceForPortalEmployee: AnyValue = null
export const cancelClaimForPortalEmployee: AnyValue = null
export const copyContractCompensationLines: AnyValue = null
export const describeBenefitEnrollmentCoverageConflict: AnyValue = null
export const detectBenefitEnrollmentCoverageConflict: AnyValue = null
export const ensureDefaultHrmCompensationComponents: AnyValue = null
export const evaluateBenefitEligibilityForEmployee: AnyValue = null
export const getBenefitEnrollmentForOrganization: AnyValue = null
export const getClaimDetail: (
  ...args: readonly AnyValue[]
) => Promise<
  | (LooseRecord & {
      readonly evidence: readonly {
        readonly id: string
        readonly documentBlobUrl: string | null
      }[]
    })
  | null
> = null as AnyValue
export const getCurrentPayrollProfileForEmployee: AnyValue = null
export const getPayrollPeriod: (
  ...args: readonly AnyValue[]
) => Promise<PayrollPeriodRow | null> = null as AnyValue
export const getPayrollPeriodPrimaryCountryCode: AnyValue = null
export const insertContractCompensationLines: AnyValue = null
export const insertSalaryAdvanceRow: AnyValue = null
export const listAdvanceInstallmentsForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly id: string
    readonly advanceId: string
    readonly sequence: number
    readonly dueAfterPeriodEndIso: string
    readonly plannedAmount: string
    readonly state: string
  }[]
> = null as AnyValue
export const listBenefitEnrollmentCoverageRowsForEmployeePlan: AnyValue = null
export const listClaimTypesForOrg: (
  ...args: readonly AnyValue[]
) => Promise<
  readonly {
    readonly id: string
    readonly code: string
    readonly name: string
    readonly currency: string
  }[]
> = null as AnyValue
export const listClaimsForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<readonly ClaimRow[]> = null as AnyValue
export const listCompensationComponentsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly { readonly id: string; readonly code: string }[]> =
  null as AnyValue
export const listEnrollmentsForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<readonly BenefitEnrollmentListRow[]> = null as AnyValue
export const listPayrollGroupsForOrg: AnyValue = null
export const listPayrollPeriodsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<PayrollPeriodRow[]> = null as AnyValue
export const listSalaryAdvancesForEmployee: (
  ...args: readonly AnyValue[]
) => Promise<readonly SalaryAdvanceListRow[]> = null as AnyValue
export const mapClaimRowToListSurfaceRow: AnyValue = null
export const parseAllowanceLineInputsFromForm: AnyValue = null
export const payrollPayslipSnapshotFromDocumentPayload: AnyValue = null
export const resolveRulePack: AnyValue = null
export const seedNewHireBenefitEnrollments: AnyValue = null
export const stablePayrollCloseStringify: AnyValue = null
export const submitClaimForEmployee: AnyValue = null
export const summarizeBenefitEligibilityFailure: AnyValue = null
export const terminateBenefitEnrollmentsForEmploymentEnd: AnyValue = null
export const upsertPayrollProfileMutation: AnyValue = null
