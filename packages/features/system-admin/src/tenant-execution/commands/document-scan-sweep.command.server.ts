import {
  listOrganizationsForCoreErpSeed,
  listTenantDocumentsPendingScan,
} from "@afenda/db";
import { getDocumentAvEnv } from "@afenda/config/env";

import { processTenantDocumentScanCommand } from "./process-tenant-document-scan.command.server";

function resolveStaleScanningBefore() {
  const avEnv = getDocumentAvEnv();
  const staleBefore = new Date();
  staleBefore.setUTCMinutes(
    staleBefore.getUTCMinutes() - avEnv.staleScanningMinutes,
  );
  return staleBefore;
}

/** Cron-safe sweep — processes pending and stale scanning ERP documents. */
export async function executeDocumentScanSweepCommand(input?: {
  organizationId?: string | null;
  limitPerOrganization?: number;
}): Promise<Record<string, unknown>> {
  const limitPerOrganization = input?.limitPerOrganization ?? 100;
  const explicitOrgId = input?.organizationId?.trim();
  const staleScanningBefore = resolveStaleScanningBefore();

  if (explicitOrgId) {
    return sweepOrganizationDocuments({
      organizationId: explicitOrgId,
      limitPerOrganization,
      staleScanningBefore,
    });
  }

  const organizations = await listOrganizationsForCoreErpSeed();
  if (organizations.length === 0) {
    return { skipped: true, reason: "no_organizations" };
  }

  const orgResults = await Promise.allSettled(
    organizations.map(async (organization) =>
      sweepOrganizationDocuments({
        organizationId: organization.id,
        limitPerOrganization,
        staleScanningBefore,
      }),
    ),
  );

  const completed: Array<Record<string, unknown>> = [];
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
    completedOrganizationCount: completed.length,
    failedOrganizationCount: failed.length,
    scannedDocumentCount: completed.reduce(
      (total, item) => total + Number(item.processedCount ?? 0),
      0,
    ),
    deferredDocumentCount: completed.reduce(
      (total, item) => total + Number(item.deferredCount ?? 0),
      0,
    ),
    failedReasons: failed,
    organizations: completed,
  };
}

async function sweepOrganizationDocuments(input: {
  organizationId: string;
  limitPerOrganization: number;
  staleScanningBefore: Date;
}) {
  const candidates = await listTenantDocumentsPendingScan({
    organizationId: input.organizationId,
    limit: input.limitPerOrganization,
    staleScanningBefore: input.staleScanningBefore,
  });

  let processedCount = 0;
  let deferredCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];
  const results: Record<string, number> = {
    passed: 0,
    failed: 0,
    quarantined: 0,
  };

  for (const document of candidates) {
    try {
      const outcome = await processTenantDocumentScanCommand({
        organizationId: input.organizationId,
        documentId: document.id,
        moduleId: document.moduleId,
      });

      if (outcome === "skipped") {
        skippedCount += 1;
        continue;
      }

      if (outcome === "deferred") {
        deferredCount += 1;
        continue;
      }

      processedCount += 1;
      results[outcome] = (results[outcome] ?? 0) + 1;
    } catch (error) {
      errors.push(
        `${document.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return {
    mode: "single-org",
    organizationId: input.organizationId,
    candidateCount: candidates.length,
    processedCount,
    deferredCount,
    skippedCount,
    results,
    errorCount: errors.length,
    errors,
  };
}
