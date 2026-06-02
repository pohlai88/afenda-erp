/**
 * @afenda/feature-lynx
 *
 * Lynx product surface — Truth Retrieval and Decision Operator.
 * Substrate (@afenda/feature-knowledge) composes into this module.
 *
 * Doctrine: docs/architecture/1005-infrastructure.md (ARCH-1005)
 * Track: docs/roadmap/005-lynx-knowledge-substrate.md (TRACK-005)
 */
export * from "./contracts";
export {
  buildLynxRunFilterSearchParams,
  lynxOperatorRequestSchema,
  parseLynxRunFilters,
} from "./schemas";
export type { LynxOperatorRequest } from "./schemas/lynx.operator.schema";
