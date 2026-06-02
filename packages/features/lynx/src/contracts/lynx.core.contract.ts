/**
 * Lynx canonical contract — ARCH-1005
 * All audits, routes, layers, and tests derive from this file.
 *
 * Doctrine: docs/architecture/1005-infrastructure.md
 * Track: docs/roadmap/005-lynx-knowledge-substrate.md
 */

export const LYNX_MODULE_ID = "lynx" as const;

/** Layers shipped in TRACK-005. Briefs and Intake deferred. */
export const LYNX_LAYERS = ["truth", "operator"] as const;
export type LynxLayer = (typeof LYNX_LAYERS)[number];

export const LYNX_AUDIT_ACTIONS = {
  truthQuery: "erp.lynx.truth.query",
  operatorRecommend: "erp.lynx.operator.recommend",
  runFeedback: "erp.lynx.run.feedback",
} as const;
export type LynxAuditAction =
  (typeof LYNX_AUDIT_ACTIONS)[keyof typeof LYNX_AUDIT_ACTIONS];

export const LYNX_ERP_HTTP_ROUTES = {
  truthSearch: "/api/internal/v1/lynx/queries/truth-search",
  operator: "/api/internal/v1/lynx/queries/operator",
  runFeedback: "/api/internal/v1/lynx/commands/record-run-feedback",
  runLedgerExport: "/api/internal/v1/lynx/queries/run-ledger-export",
} as const;
export type LynxErpHttpRoute =
  (typeof LYNX_ERP_HTTP_ROUTES)[keyof typeof LYNX_ERP_HTTP_ROUTES];

/**
 * Truth response mandatory section headers.
 * Every truth response must include exactly these four sections in order.
 */
export const LYNX_TRUTH_RESPONSE_SECTIONS = [
  "### Answer",
  "### Evidence used",
  "### Limitations",
  "### Next safe action",
] as const;

/** Maximum operator tool call round-trips. */
export const LYNX_OPERATOR_MAX_STEPS = 5 as const;

/**
 * Gateway feature tags for Lynx routes — used for AI spend reporting.
 */
export const LYNX_GATEWAY_FEATURES = {
  truth: "lynx-truth",
  operator: "lynx-operator",
} as const;
