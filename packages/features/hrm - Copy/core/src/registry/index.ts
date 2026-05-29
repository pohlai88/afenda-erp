/**
 * Narrow HRM door: registry, paths, and nav helpers only.
 * Import from `@afenda/feature-hrm-core/registry` when pages/actions are not needed.
 */
export {
  HRM_CAPABILITIES,
  HRM_NAV_NAMESPACE,
  buildHrmNav,
  getAllowedHrmAppsSubsegments,
  getHrmAuditPrefixes,
  getHrmCapabilityById,
  getHrmCapabilityForSegment,
  hrmNavLabelKey,
  isAllowedHrmAppsSubsegment,
  organizationHrmComplianceDetailPath,
  organizationHrmPath,
  type HrmCapability,
  type HrmNavItem,
} from "../routing/constants"

export type { HrmNavKey } from "../contracts/types"

export {
  HRM_APPS_CAPABILITY_SEGMENT_SET,
  type HrmAppsCapabilitySegment,
} from "../routing/hrm-apps-path.shared"

export {
  HrmCapabilityAccessDenied,
  HrmComplianceEvidenceAccessDenied,
  HrmAccessDeniedMessage,
  HrmOverviewAccessDenied,
  HrmShellAccessDenied,
  HrmShellAccessDeniedDetail,
  HrmShellAccessDeniedFromNav,
} from "../components/hrm-shell-access-denied.server"
