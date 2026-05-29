import "server-only"

export { upsertPayrollProfileMutation } from "./data/payroll-profile.mutations.server"

export {
  computePayrollRun,
  derivePayrollTraceability,
} from "./data/payroll-engine.server"

export type {
  PayrollEngineInput,
  PayrollEngineResult,
  PayrollContractAllowanceInput,
  PayrollLineInput,
  PayrollPeriodTraceability,
} from "./data/payroll-engine.server"

export {
  listPayrollPeriodsForOrg,
  getPayrollPeriod,
  listPayrollRunsForPeriod,
  listPayrollLinesForRun,
  listPayrollLinesForPeriod,
  getPayrollRunInputSnapshot,
  isAttendancePayrollReadyForPeriod,
  hasApprovedPayrollPeriodLockApproval,
  getApprovedPayrollPeriodLockApproval,
  getPendingPayrollPeriodLockApprovalId,
  getPayrollPeriodPrimaryCountryCode,
  listClosedPayrollPeriodsOverlappingRange,
} from "./data/payroll.queries.server"

export type {
  PayrollPeriodRow,
  PayrollRunRow,
  PayrollLineRow,
  PayrollPeriodLockApprovalRow,
} from "./data/payroll.queries.server"

export { resolvePayrollSurfaceCapabilities } from "./data/payroll-capabilities.server"
export type { PayrollSurfaceCapabilities } from "./data/payroll-capabilities.server"

export {
  buildPayrollCloseSnapshot,
  buildPayrollPostingPreview,
  buildPayslipSnapshotForRun,
  listPayrollCloseExceptions,
  persistPayrollPayslipSnapshots,
} from "./data/payroll-close.server"

export type {
  PayrollCloseActionFormState,
  PayrollCloseChecklistItem,
  PayrollCloseException,
  PayrollCloseSnapshot,
  PayrollPayslipSnapshot,
  PayrollPostingPreview,
} from "./data/payroll-close.shared"

export { stablePayrollCloseStringify } from "./data/payroll-close.shared"

export {
  buildPayrollPostingRecord,
  getPayrollPostingRecord,
  postPayrollPeriod,
} from "./data/payroll-posting.server"

export type {
  PayrollPostingRecord,
  PayrollPostingRecordLine,
  PayrollPostingResult,
  PayrollPostingState,
} from "./data/payroll-posting.shared"
