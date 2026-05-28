import { syncOrgKnowledge } from "@afenda/feature-knowledge/server";
import { listOrganizationsForCoreErpSeed, runWithOrganizationContext } from "@afenda/db";

import { runCronJob } from "@/app-cron/run";

export async function GET(request: Request): Promise<Response> {
  return runCronJob({
    request,
    jobName: "knowledge-sync",
    operation: "sync-all-org-knowledge",
    execute: async () => {
      const organizationId = process.env.CRON_ORGANIZATION_ID?.trim();
      if (organizationId) {
        const result = await runWithOrganizationContext(organizationId, () =>
          syncOrgKnowledge(organizationId),
        );

        return {
          mode: "single-org",
          organizationId,
          totalCommitted: result.totalCommitted,
          totalSkipped: result.totalSkipped,
          totalChunks: result.totalChunks,
          errors: result.errors,
          sourceCount: result.sources.length,
        };
      }

      const organizations = await listOrganizationsForCoreErpSeed();
      if (organizations.length === 0) {
        return { skipped: true, reason: "No organizations available for sync." };
      }

      const orgResults = await Promise.allSettled(
        organizations.map(async (organization) => {
          const result = await runWithOrganizationContext(organization.id, () =>
            syncOrgKnowledge(organization.id),
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
        totalCommitted: completed.reduce(
          (acc, item) => acc + item.totalCommitted,
          0,
        ),
        totalSkipped: completed.reduce((acc, item) => acc + item.totalSkipped, 0),
        totalChunks: completed.reduce((acc, item) => acc + item.totalChunks, 0),
        totalErrors: completed.reduce((acc, item) => acc + item.errors, 0),
        sourceCount: completed.reduce((acc, item) => acc + item.sourceCount, 0),
        failedReasons: failed,
        organizations: completed,
      };
    },
  });
}
