import {
  deleteHrCsfCompetencyRequirementInTx,
  deleteHrCsfSkillRequirementInTx,
  listHrCsfCompetencyRequirementsWindow,
  listHrCsfSkillRequirementsWindow,
  upsertHrCsfCompetencyRequirementInTx,
  upsertHrCsfSkillRequirementInTx,
} from "@afenda/db";

import type {
  HrCsfCompetencyRequirementInput,
  HrCsfSkillRequirementInput,
} from "../schemas/hr.talent.csf-mutation.schema";
import type { HrCsfRequirementScope } from "../schemas/hr.talent.csf-constants.shared";

const CSF_DEFAULT_PAGE_SIZE = 25;

export async function listHrCsfCompetencyRequirements(input: {
  organizationId: string;
  competencyId?: string;
  scope?: HrCsfRequirementScope;
  scopeRef?: string;
  limit?: number;
  offset?: number;
}) {
  return listHrCsfCompetencyRequirementsWindow({
    organizationId: input.organizationId,
    competencyId: input.competencyId,
    scope: input.scope,
    scopeRef: input.scopeRef,
    limit: input.limit ?? CSF_DEFAULT_PAGE_SIZE,
    offset: input.offset,
  });
}

export async function listHrCsfSkillRequirements(input: {
  organizationId: string;
  skillId?: string;
  scope?: HrCsfRequirementScope;
  scopeRef?: string;
  requirementClass?: HrCsfSkillRequirementInput["requirementClass"];
  limit?: number;
  offset?: number;
}) {
  return listHrCsfSkillRequirementsWindow({
    organizationId: input.organizationId,
    skillId: input.skillId,
    scope: input.scope,
    scopeRef: input.scopeRef,
    requirementClass: input.requirementClass,
    limit: input.limit ?? CSF_DEFAULT_PAGE_SIZE,
    offset: input.offset,
  });
}

export async function upsertHrCsfCompetencyRequirement(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrCsfCompetencyRequirementInput;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  return runWithOrganizationContext(input.organizationId, async (db) =>
    upsertHrCsfCompetencyRequirementInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      ...input.payload,
    }),
  );
}

export async function upsertHrCsfSkillRequirement(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrCsfSkillRequirementInput;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  return runWithOrganizationContext(input.organizationId, async (db) =>
    upsertHrCsfSkillRequirementInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      ...input.payload,
    }),
  );
}

export async function deleteHrCsfCompetencyRequirement(input: {
  organizationId: string;
  actorUserId: string;
  requirementId: string;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  return runWithOrganizationContext(input.organizationId, async (db) =>
    deleteHrCsfCompetencyRequirementInTx(db, input),
  );
}

export async function deleteHrCsfSkillRequirement(input: {
  organizationId: string;
  actorUserId: string;
  requirementId: string;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  return runWithOrganizationContext(input.organizationId, async (db) =>
    deleteHrCsfSkillRequirementInTx(db, input),
  );
}
