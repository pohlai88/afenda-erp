import {
  listOrganizationsForCoreErpSeed,
  listTenantDocumentsPastRetentionExpiry,
  runHrDocumentExpirySweep,
  isOrganizationDocumentLegalHoldActive,
} from "@afenda/db";

import { executeHrDocumentDestructionSweepCommand } from "./hr-document-destruction-sweep.command.server";
import { expireTenantDocumentCommand } from "./expire-tenant-document.command.server";

/** Cron-safe sweep — expires short-term ERP registry documents past retention. */
export async function executeDocumentRetentionExpirySweepCommand(input?: {
  organizationId?: string | null;
  limitPerOrganization?: number;
}): Promise<Record<string, unknown>> {
  const limitPerOrganization = input?.limitPerOrganization ?? 100;
  const explicitOrgId = input?.organizationId?.trim();

  if (explicitOrgId) {
    const hrSweep = await runHrDocumentExpirySweep();
    const hrDestructionSweep = await executeHrDocumentDestructionSweepCommand({
      organizationId: explicitOrgId,
      limitPerOrganization,
    });

    return {
      ...(await sweepOrganizationDocuments({
        organizationId: explicitOrgId,
        actorAuthUserId: await resolveCronActorForOrganization(explicitOrgId),
        limitPerOrganization,
      })),
      hrDocumentExpirySweep: hrSweep,
      hrDocumentDestructionSweep: hrDestructionSweep,
    };
  }

  const organizations = await listOrganizationsForCoreErpSeed();
  if (organizations.length === 0) {
    return { skipped: true, reason: "no_organizations" };
  }

  const hrSweep = await runHrDocumentExpirySweep();
  const hrDestructionSweep = await executeHrDocumentDestructionSweepCommand({
    limitPerOrganization,
  });

  const orgResults = await Promise.allSettled(
    organizations.map(async (organization) =>
      sweepOrganizationDocuments({
        organizationId: organization.id,
        actorAuthUserId: organization.ownerAuthUserId,
        limitPerOrganization,
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
    expiredDocumentCount: completed.reduce(
      (total, item) => total + Number(item.expiredCount ?? 0),
      0,
    ),
    hrDocumentExpirySweep: hrSweep,
    hrDocumentDestructionSweep: hrDestructionSweep,
    failedReasons: failed,
    organizations: completed,
  };
}

async function resolveCronActorForOrganization(organizationId: string) {
  const organizations = await listOrganizationsForCoreErpSeed();
  const organization = organizations.find((row) => row.id === organizationId);

  if (!organization) {
    throw new Error(`Organization not found for retention sweep: ${organizationId}`);
  }

  return organization.ownerAuthUserId;
}

async function sweepOrganizationDocuments(input: {
  organizationId: string;
  actorAuthUserId: string;
  limitPerOrganization: number;
}) {
  if (await isOrganizationDocumentLegalHoldActive(input.organizationId)) {
    return {
      mode: "single-org",
      organizationId: input.organizationId,
      skipped: true,
      reason: "organization_legal_hold",
      scannedCount: 0,
      expiredCount: 0,
      errorCount: 0,
      errors: [],
    };
  }

  const candidates = await listTenantDocumentsPastRetentionExpiry({
    organizationId: input.organizationId,
    limit: input.limitPerOrganization,
  });

  let expiredCount = 0;
  const errors: string[] = [];

  for (const document of candidates) {
    try {
      await expireTenantDocumentCommand({
        organizationId: input.organizationId,
        documentId: document.id,
        moduleId: document.moduleId,
        actorAuthUserId: input.actorAuthUserId,
        metadata: {
          title: document.title,
          retentionClass: document.retentionClass,
          createdAt: document.createdAt.toISOString(),
        },
      });
      expiredCount += 1;
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
    scannedCount: candidates.length,
    expiredCount,
    errorCount: errors.length,
    errors,
  };
}
