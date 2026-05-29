/**
 * Client-safe exports for @afenda/feature-hr.
 * Must not import @afenda/db, @afenda/ai, @afenda/workflows, @afenda/auth/server, or node:*.
 */
export {
  HR_MODULE_ID,
  HR_CAPABILITIES,
  HR_DEFAULT_PAGE_SIZE,
  HR_MAX_PAGE_SIZE,
  clampHrPageSize,
  type HrCapability,
  type HrListWindow,
  type HrModuleId,
  type HrRecordKind,
  type HrRecordRef,
  isHrCapability,
} from "./contracts";
