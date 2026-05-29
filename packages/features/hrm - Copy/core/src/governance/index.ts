import type { HrmOrgSession } from "../_module-governance/hrm-action-guard.server"

export {
  requireHrmOrgTenantFromForm,
  type HrmOrgSession,
} from "../_module-governance/hrm-action-guard.server"

export type HrmActionOrgTenantContext = {
  readonly session: HrmOrgSession
  readonly orgSlug: string
}
export {
  hrmActionFailure,
  hrmCodedActionFailure,
  hrmTransactionFailure,
} from "../_module-governance/hrm-action-result.shared"
export {
  requireHrmAdmin,
  requireHrmPermission,
} from "../_module-governance/hrm-admin-guard.server"
export {
  calendarDayBeforeIso,
  formatUtcDateOnly,
  isoDateOnlyToUtcDate,
} from "../_module-governance/hrm-calendar-dates.server"
export { buildGovernedHrmModulePageHeader } from "../_module-governance/hrm-governed-page-header.server"
