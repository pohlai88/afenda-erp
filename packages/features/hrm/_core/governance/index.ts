import type { HrmOrgSession } from "./hrm-action-guard.server"

export {
  requireHrmOrgTenantFromForm,
  type HrmOrgSession,
} from "./hrm-action-guard.server"

export type HrmActionOrgTenantContext = {
  readonly session: HrmOrgSession
  readonly orgSlug: string
}
export {
  hrmActionFailure,
  hrmCodedActionFailure,
  hrmTransactionFailure,
} from "./hrm-action-result.shared"
export {
  requireHrmAdmin,
  requireHrmPermission,
} from "./hrm-admin-guard.server"
export {
  calendarDayBeforeIso,
  formatUtcDateOnly,
  isoDateOnlyToUtcDate,
} from "./hrm-calendar-dates.server"
export { buildGovernedHrmModulePageHeader } from "./hrm-governed-page-header.server"
