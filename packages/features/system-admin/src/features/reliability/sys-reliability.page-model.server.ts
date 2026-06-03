import {
  mapApiCredentialToListRow,
  mapSsoConnectionToListRow,
  mapWebhookDeliveryToListRow,
  mapWebhookToListRow,
} from "../../integrations/data/system-admin.integrations.mapper.server";
import { evaluateIntegrationsReadiness } from "../../integrations/data/system-admin.integrations.readiness.server";
import {
  listApiCredentials,
  listSsoConnections,
  listWebhookDeliveries,
  listWebhooks,
} from "../../integrations/data/system-admin.integrations.repository.server";
import type {
  SystemAdminReliabilityIssue,
  SystemAdminReliabilityOperationalLinkRow,
  SystemAdminReliabilitySummary,
} from "../contracts/system-admin.reliability-issue.contract";
import { getCronHealthSurfaceRows } from "./system-admin.cron-health.query.server";
import type { CronHealthSurfaceRow } from "../contracts/system-admin.cron-health.contract";
import {
  buildReliabilityOperationalLinkRows,
  collectCronReliabilityIssues,
  collectIntegrationReliabilityIssues,
  collectMigrationReliabilityIssues,
  collectPlatformInstrumentationIssues,
  collectRepositoryReliabilityIssues,
  collectWorkflowReliabilityIssues,
} from "./system-admin.reliability.checks.server";
import { evaluateMigrationHealth } from "./system-admin.reliability.migration-health.server";
import { evaluateRepositoryHealth } from "./system-admin.reliability.repository-health.server";
import {
  groupReliabilityIssuesBySeverity,
  sortReliabilityIssues,
  summarizeReliabilityIssues,
} from "./system-admin.reliability.verdict.server";

export type SystemAdminReliabilityPageModel = {
  cronRows: readonly CronHealthSurfaceRow[];
  operationalLinks: readonly SystemAdminReliabilityOperationalLinkRow[];
  issues: readonly SystemAdminReliabilityIssue[];
  summary: SystemAdminReliabilitySummary;
  issuesBySeverity: ReturnType<typeof groupReliabilityIssuesBySeverity>;
};

export async function getSystemAdminReliabilityPageModel(input: {
  organizationId: string;
}): Promise<SystemAdminReliabilityPageModel> {
  const [
    cronRows,
    repositoryHealth,
    migrationHealth,
    credentialRows,
    webhookRows,
    deliveryRows,
    ssoRows,
  ] = await Promise.all([
    getCronHealthSurfaceRows(),
    evaluateRepositoryHealth(),
    evaluateMigrationHealth(),
    listApiCredentials({ organizationId: input.organizationId, limit: 100 }),
    listWebhooks({ organizationId: input.organizationId, limit: 100 }),
    listWebhookDeliveries({ organizationId: input.organizationId, limit: 50 }),
    listSsoConnections({ organizationId: input.organizationId, limit: 50 }),
  ]);

  const integrationsReadiness = evaluateIntegrationsReadiness({
    credentials: credentialRows.map(mapApiCredentialToListRow),
    webhooks: webhookRows.map(mapWebhookToListRow),
    deliveries: deliveryRows.map(mapWebhookDeliveryToListRow),
    ssoConnections: ssoRows.map(mapSsoConnectionToListRow),
  });

  const workflowIssues = await collectWorkflowReliabilityIssues({
    organizationId: input.organizationId,
  });

  const issues = sortReliabilityIssues([
    ...collectCronReliabilityIssues(cronRows),
    ...collectIntegrationReliabilityIssues(integrationsReadiness),
    ...collectRepositoryReliabilityIssues(repositoryHealth),
    ...collectMigrationReliabilityIssues(migrationHealth),
    ...workflowIssues,
    ...collectPlatformInstrumentationIssues(),
  ]);

  return {
    cronRows,
    operationalLinks: buildReliabilityOperationalLinkRows(),
    issues,
    summary: summarizeReliabilityIssues(issues),
    issuesBySeverity: groupReliabilityIssuesBySeverity(issues),
  };
}
