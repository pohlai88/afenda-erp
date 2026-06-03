/**
 * Canonical AI HTTP paths — ARCH-1004 §5 (internal scope + plane).
 */
export const AI_ERP_HTTP_ROUTES = {
  erpAssistant: "/api/internal/v1/ai/queries/erp-assistant",
  gatewaySpend: "/api/internal/v1/ai/queries/gateway-spend",
  extractDocument: "/api/internal/v1/ai/commands/extract-document",
} as const;

export type AiErpHttpRoute =
  (typeof AI_ERP_HTTP_ROUTES)[keyof typeof AI_ERP_HTTP_ROUTES];
