/**
 * Client-safe exports for @afenda/feature-lynx.
 * Serializable DTOs, client-safe constants only.
 */
export {
  LYNX_MODULE_ID,
  LYNX_LAYERS,
  LYNX_AUDIT_ACTIONS,
  LYNX_ERP_HTTP_ROUTES,
  LYNX_TRUTH_RESPONSE_SECTIONS,
  LYNX_OPERATOR_MAX_STEPS,
  LYNX_GATEWAY_FEATURES,
} from "./lynx.contract";
export type { LynxLayer, LynxAuditAction, LynxErpHttpRoute } from "./lynx.contract";
export * from "./readiness-contract";
