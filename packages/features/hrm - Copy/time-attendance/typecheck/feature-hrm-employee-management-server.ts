type AnyValue = any
type LooseRecord = { readonly [key: string]: any }

export const HRM_DOCUMENT_AUDIT: AnyValue = null
export const blobUrlMatchesOrgHrmEmployeePath: AnyValue = null
export const deriveHrmDocumentGroup: AnyValue = null
export const listDepartmentsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listJobGradesForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const listPositionsForOrg: (
  ...args: readonly AnyValue[]
) => Promise<readonly LooseRecord[]> = null as AnyValue
export const requireMutableEmployeeRecord: AnyValue = null
export const resolveManagerApproverUserId: AnyValue = null
export const withPortalMutationSpan: AnyValue = null
