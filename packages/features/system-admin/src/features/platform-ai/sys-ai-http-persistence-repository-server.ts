/**
 * Platform AI HTTP persistence — `@afenda/db` boundary for ERP assistant routes (**ARCH-1002** §4).
 */
export {
  createAiActionSandbox,
  createAiUsageEvent,
  isAiFeatureEnabledForOrganization,
  registerAiApprovalProposal,
  registerAiDocumentExtraction,
} from "@afenda/db";
