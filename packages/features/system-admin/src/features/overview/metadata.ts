/**
 * Governed metadata door — system-admin/overview
 * List surfaces, surface keys, and metadata-only copy. No tenant I/O.
 */
export * from "./sys-overview-stat.surface";
export {
  getSystemAdminSurfaceKeys,
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiUsageSurfaceKey,
  systemAdminApiCredentialsSurfaceKey,
  systemAdminApprovalsSurfaceKey,
  systemAdminAuditViewerSurfaceKey,
  systemAdminBillingSurfaceKey,
  systemAdminCapabilitiesSurfaceKey,
  systemAdminCronSurfaceKey,
  systemAdminReliabilityOperationalLinksSurfaceKey,
  systemAdminReliabilitySurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
  systemAdminGatewaySpendSurfaceKey,
  systemAdminUsersSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminModulesSurfaceKey,
  systemAdminOrganizationSurfaceKey,
  systemAdminPermissionsSurfaceKey,
  systemAdminRolesSurfaceKey,
  systemAdminPoliciesSurfaceKey,
  systemAdminRetentionSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
  systemAdminSecuritySurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "./sys-surface-keys.shared";
