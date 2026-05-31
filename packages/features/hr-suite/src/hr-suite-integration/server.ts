export {
  buildHrModuleExecutionGuard,
  requireHrCapabilities,
  requireHrCapability,
  requireHrRead,
  type HrModuleCapabilityRequirementMode,
  type HrModuleExecutionGuard,
} from "./policies/hr-suite-access.policy.server";
export {
  hrSuiteActionFailure,
  toHrSuiteActionFailure,
  toHrSuiteNativeFormAction,
  toHrSuiteResultFormAction,
  type HrSuiteActionFailureMapper,
  type HrSuiteActionFailureOptions,
  type HrSuiteActionStateHandler,
} from "./actions/hr-suite-action-result.shared";
