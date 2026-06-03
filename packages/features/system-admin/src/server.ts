/**
 * Server-only exports for @afenda/feature-system-admin.
 */
import "@afenda/kernel/server";
import "./tenant-execution/policies/register-tenant-execution-policies.server";

export { getApiAuthContext, requireCapability } from "@afenda/kernel/server";
export * from "./approvals/server";
export * from "./audit-viewer/server";
export * from "./billing/server";
export * from "./capabilities/server";
export * from "./data-management/server";
export * from "./diagnostics/server";
export * from "./integrations/server";
export * from "./lynx/server";
export * from "./platform-ai/server";
export * from "./memberships/server";
export * from "./modules/server";
export * from "./organization/server";
export * from "./overview/server";
export * from "./permissions/server";
export * from "./policies/server";
export * from "./reliability/server";
export * from "./roles/server";
export * from "./security/server";
export * from "./tenant-execution/server";
export * from "./users/server";
