type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export type DependentRow = LooseRecord

export const HRM_ESS_AUDIT: AnyValue = null
export const getEmployeeForOrganization: (
  ...args: readonly AnyValue[]
) => Promise<LooseRecord | null> = null as AnyValue
export const listComplianceEvidenceForPeriod: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listDependentsForOrganization: (
  ...args: readonly AnyValue[]
) => Promise<readonly DependentRow[]> = null as AnyValue
export const resolveEmployeeOrgContextReference: AnyValue = null
export const withPortalMutationSpan: AnyValue = null
