import {
  listOrganizationsForCoreErpSeed,
  runWithOrganizationContext,
} from "@afenda/db";

import { executeKnowledgeSyncOrgCommand } from "./knowledge.sync-org.command.server";

/** Command: cron-safe multi-org knowledge sync sweep. */
export async function executeKnowledgeScheduledSyncSweepCommand(input?: {
  organizationId?: string | null;
}): Promise<Record<string, unknown>> {
  const explicitOrgId = input?.organizationId?.trim();
  if (explicitOrgId) {
    const result = await runWithOrganizationContext(explicitOrgId, () =>
      executeKnowledgeSyncOrgCommand({ organizationId: explicitOrgId }),
    );

    return {
      mode: "single-org",
      organizationId: explicitOrgId,
      totalCommitted: result.totalCommitted,
      totalSkipped: result.totalSkipped,
      totalChunks: result.totalChunks,
      errors: result.errors,
      sourceCount: result.sources.length,
    };
  }

  const organizations = await listOrganizationsForCoreErpSeed();
  if (organizations.length === 0) {
    return { skipped: true, reason: "no_organizations" };
  }

  const orgResults = await Promise.allSettled(
    organizations.map(async (organization) => {
      const result = await runWithOrganizationContext(organization.id, () =>
        executeKnowledgeSyncOrgCommand({ organizationId: organization.id }),
      );

      return {
        organizationId: organization.id,
        sourceCount: result.sources.length,
        totalCommitted: result.totalCommitted,
        totalSkipped: result.totalSkipped,
        totalChunks: result.totalChunks,
        errors: result.errors,
      };
    }),
  );

  const completed: Array<{
    organizationId: string;
    sourceCount: number;
    totalCommitted: number;
    totalSkipped: number;
    totalChunks: number;
    errors: number;
  }> = [];
  const failed: string[] = [];

  for (const result of orgResults) {
    if (result.status === "fulfilled") {
      completed.push(result.value);
      continue;
    }

    failed.push(
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason),
    );
  }

  return {
    mode: "all-orgs",
    organizationCount: organizations.length,
    syncedOrganizationCount: completed.length,
    failedOrganizationCount: failed.length,
    totalCommitted: completed.reduce((acc, item) => acc + item.totalCommitted, 0),
    totalSkipped: completed.reduce((acc, item) => acc + item.totalSkipped, 0),
    totalChunks: completed.reduce((acc, item) => acc + item.totalChunks, 0),
    totalErrors: completed.reduce((acc, item) => acc + item.errors, 0),
    sourceCount: completed.reduce((acc, item) => acc + item.sourceCount, 0),
    failedReasons: failed,
    organizations: completed,
  };
}
