import {
  listHrEmployeeDocumentsEligibleForDestruction,
  listOrganizationsForCoreErpSeed,
  isOrganizationDocumentLegalHoldActive,
} from "@afenda/db";

import { destroyHrEmployeeDocumentCommand } from "./sys-destroy-hr-employee-document-command-server";

/** Cron-safe sweep — destroys HR employee documents archived past grace period. */
export async function executeHrDocumentDestructionSweepCommand(input?: {
  organizationId?: string | null;
  limitPerOrganization?: number;
}): Promise<Record<string, unknown>> {
  const limitPerOrganization = input?.limitPerOrganization ?? 100;
  const explicitOrgId = input?.organizationId?.trim();

  if (explicitOrgId) {
    return sweepOrganizationHrDocuments({
      organizationId: explicitOrgId,
      actorAuthUserId: await resolveCronActorForOrganization(explicitOrgId),
      limitPerOrganization,
    });
  }

  const organizations = await listOrganizationsForCoreErpSeed();
  if (organizations.length === 0) {
    return { skipped: true, reason: "no_organizations" };
  }

  let destroyedCount = 0;
  const errors: string[] = [];

  for (const organization of organizations) {
    const result = await sweepOrganizationHrDocuments({
      organizationId: organization.id,
      actorAuthUserId: organization.ownerAuthUserId,
      limitPerOrganization,
    });

    destroyedCount += Number(result.destroyedCount ?? 0);
    const orgErrors = result.errors;
    if (Array.isArray(orgErrors)) {
      errors.push(...orgErrors.map(String));
    }
  }

  return {
    mode: "all-orgs",
    organizationCount: organizations.length,
    destroyedDocumentCount: destroyedCount,
    errorCount: errors.length,
    errors,
  };
}

async function resolveCronActorForOrganization(organizationId: string) {
  const organizations = await listOrganizationsForCoreErpSeed();
  const organization = organizations.find((row) => row.id === organizationId);

  if (!organization) {
    throw new Error(
      `Organization not found for HR destruction sweep: ${organizationId}`,
    );
  }

  return organization.ownerAuthUserId;
}

async function sweepOrganizationHrDocuments(input: {
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
      candidateCount: 0,
      destroyedCount: 0,
      errorCount: 0,
      errors: [],
    };
  }

  const candidates = await listHrEmployeeDocumentsEligibleForDestruction({
    organizationId: input.organizationId,
    limit: input.limitPerOrganization,
  });

  let destroyedCount = 0;
  const errors: string[] = [];

  for (const document of candidates) {
    try {
      await destroyHrEmployeeDocumentCommand({
        organizationId: input.organizationId,
        documentId: document.id,
        actorAuthUserId: input.actorAuthUserId,
      });
      destroyedCount += 1;
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
    destroyedCount,
    errorCount: errors.length,
    errors,
  };
}
