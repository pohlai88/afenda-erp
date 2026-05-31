import {
  createHrCsfProficiencyScaleInTx,
  getHrCsfProficiencyScaleWithLevels,
  listHrCsfProficiencyScalesWindow,
  updateHrCsfProficiencyScaleInTx,
} from "@afenda/db";

import type {
  HrCsfProficiencyLevelSummary,
  HrCsfProficiencyScaleSummary,
} from "../contracts/hr.talent.csf-library.contract";
import type {
  HrCsfCreateProficiencyScaleInput,
  HrCsfUpdateProficiencyScaleInput,
} from "../schemas/hr.talent.csf-mutation.schema";

const CSF_DEFAULT_PAGE_SIZE = 25;

export async function listHrCsfProficiencyScales(input: {
  organizationId: string;
  search?: string;
  scaleStatus?: HrCsfCreateProficiencyScaleInput["scaleStatus"];
  limit?: number;
  offset?: number;
}) {
  return listHrCsfProficiencyScalesWindow({
    organizationId: input.organizationId,
    search: input.search,
    scaleStatus: input.scaleStatus,
    limit: input.limit ?? CSF_DEFAULT_PAGE_SIZE,
    offset: input.offset,
  });
}

export async function getHrCsfProficiencyScaleDetail(input: {
  organizationId: string;
  scaleId: string;
}): Promise<{
  scale: HrCsfProficiencyScaleSummary;
  levels: readonly HrCsfProficiencyLevelSummary[];
} | null> {
  const result = await getHrCsfProficiencyScaleWithLevels(input);
  if (!result) return null;

  return {
    scale: {
      id: result.scale.id,
      code: result.scale.code,
      name: result.scale.name,
      description: result.scale.description,
      scaleStatus: result.scale.scaleStatus,
    },
    levels: result.levels.map((level) => ({
      id: level.id,
      levelOrder: level.levelOrder,
      code: level.code,
      name: level.name,
      description: level.description,
      assessmentCriteria: level.assessmentCriteria,
    })),
  };
}

export async function createHrCsfProficiencyScale(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrCsfCreateProficiencyScaleInput;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  return runWithOrganizationContext(input.organizationId, async (db) =>
    createHrCsfProficiencyScaleInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      ...input.payload,
    }),
  );
}

export async function updateHrCsfProficiencyScale(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrCsfUpdateProficiencyScaleInput;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  const { scaleId, ...updates } = input.payload;
  return runWithOrganizationContext(input.organizationId, async (db) =>
    updateHrCsfProficiencyScaleInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      scaleId,
      ...updates,
    }),
  );
}
