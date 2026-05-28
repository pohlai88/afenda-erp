/**
 * Client-safe exports for @afenda/feature-system-admin.
 * Serializable DTOs and Zod schemas only — no server graph.
 */

export const systemAdminRoutePaths = {
  hub: "/system-admin",
  identity: "/system-admin/identity",
  settings: "/system-admin/settings",
  audit: "/system-admin/audit",
  integrations: "/system-admin/integrations",
  machineLayer: "/system-admin/machine-layer",
  reliability: "/system-admin/reliability",
  billing: "/system-admin/billing",
} as const;

export {
  isSystemAdminApiScope,
  isSystemAdminPermissionKey,
  isSystemAdminWebhookEvent,
  systemAdminLynxOutcomeMonitorThresholdCatalog,
  systemAdminApiScopes,
  systemAdminPermissionCatalog,
  systemAdminWebhookEvents,
  systemAdminDefaultWebhookEventPresets,
  type SystemAdminApiScope,
  type SystemAdminCatalogOption,
  type SystemAdminLynxOutcomeMonitorId,
  type SystemAdminLynxOutcomeMonitorThresholdKey,
  type SystemAdminWebhookEvent,
} from "./catalogs";

export type { SystemAdminActionResult } from "./action-results";
export type {
  CreateApiCredentialActionData,
  CreateWebhookActionData,
  InviteMemberActionData,
} from "./dtos";
