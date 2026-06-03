import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  getOrganizationEncryptionSettings,
  getOrganizationObjectStorageProvider,
} from "@afenda/db";
import { assertObjectStorageConfigured } from "@afenda/object-storage/server";
import { loadSystemAdminDocumentQuarantineInboxWindow } from "../../tenant-execution/data/system-admin.document-quarantine-inbox.read-model.server";
import { loadOrganizationStorageQuotaSnapshot } from "../../tenant-execution/data/system-admin.organization-storage-quota.read-model.server";
import { getSystemAdminOrganizationSecuritySettings } from "./system-admin.security.query.server";
import { evaluateSecurityReadiness } from "./system-admin.security.readiness.server";
import { listSystemAdminSecurityRecentChanges } from "./system-admin.security.recent-changes.server";
import { systemAdminSecurityAuditActions } from "../events/system-admin.security.event";

export async function buildSystemAdminSecurityPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
}) {
  const [security, recentChanges, quarantineWindow, storageQuota, objectStorageProvider, encryptionSettings] =
    await Promise.all([
    getSystemAdminOrganizationSecuritySettings({
      organizationId: input.organizationId,
    }),
    listSystemAdminSecurityRecentChanges({
      organizationId: input.organizationId,
    }),
    loadSystemAdminDocumentQuarantineInboxWindow({
      organizationId: input.organizationId,
    }),
    loadOrganizationStorageQuotaSnapshot({
      organizationId: input.organizationId,
    }),
    getOrganizationObjectStorageProvider({
      organizationId: input.organizationId,
    }),
    getOrganizationEncryptionSettings({
      organizationId: input.organizationId,
    }),
  ]);

  const objectStorageEnv = assertObjectStorageConfigured();
  const deploymentProvider = objectStorageEnv.configured
    ? objectStorageEnv.provider
    : "vercel-blob";

  const readiness = evaluateSecurityReadiness(security);

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: systemAdminSecurityAuditActions.view,
    targetType: "organization_security_settings",
    targetId: input.organizationId,
    metadata: {
      readinessVerdict: readiness.verdict,
      issueCount: readiness.issues.length,
      recentChangeCount: recentChanges.length,
    },
  });

  return {
    security,
    readiness,
    recentChanges,
    quarantineWindow,
    storageQuota,
    objectStorageProvider,
    encryptionSettings,
    deploymentProvider,
  };
}
