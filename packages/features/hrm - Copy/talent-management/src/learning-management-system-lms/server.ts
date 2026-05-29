import "server-only"

export {
  resolveLmsSurfaceAccess,
  type LmsSurfaceAccess,
} from "./data/lms-access.server"

export {
  getLmsComplianceCompletionSnapshot,
  getLmsOnboardingCompletionSnapshot,
  getLmsTrainingDevelopmentRefs,
  type LmsComplianceMandatoryCompletionRow,
  type LmsOnboardingLearningCompletionRow,
  type LmsTrainingDevelopmentCompletionRef,
} from "./data/lms-integration.server"
