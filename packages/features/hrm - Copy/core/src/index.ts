export * from "./shared"

export {
  HrmCapabilityPlaceholderPage,
  HrmOverviewPage,
} from "./_hrm_landing_page/hrm-pages"
export {
  HrmCapabilityAccessDenied,
  HrmComplianceEvidenceAccessDenied,
  HrmOverviewAccessDenied,
  HrmShellAccessDenied,
  HrmShellAccessDeniedDetail,
  HrmShellAccessDeniedFromNav,
} from "./components/hrm-shell-access-denied.server"
export { buildHrmRailSlots } from "./_internal-cross-cutting/hrm-rail-slots"
