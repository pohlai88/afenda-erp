import {
  createHrShiftCoverageRequirement,
  getHrShiftSchedulingPolicy,
  listHrShiftCoverageAssignmentSlices,
  listHrShiftCoverageRequirementsWindow,
  type HrShiftCoverageCompareWindow,
  type HrShiftCoverageRequirementRow,
} from "@afenda/db";

import type { HrSftCreateCoverageRequirementInput } from "../schemas/hr.time.sft-coverage.schema";
import {
  computeCoverageCompareRow,
  type HrShiftCoverageCompareRow,
} from "./hr.time.sft-coverage.shared";

export type HrSftCoverageCompareWindow = {
  rows: readonly HrShiftCoverageCompareRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function toRequirementScope(
  row: HrShiftCoverageRequirementRow,
): Parameters<typeof computeCoverageCompareRow>[0]["requirement"] {
  return {
    requirementId: row.id,
    requirementDate: row.requirementDate,
    templateId: row.templateId,
    templateCode: row.templateCode,
    templateName: row.templateName,
    departmentId: row.departmentId,
    departmentName: row.departmentName,
    positionId: row.positionId,
    positionCode: row.positionCode,
    locationCode: row.locationCode,
    roleCode: row.roleCode,
    requiredSkillCode: row.requiredSkillCode,
    requiredCertificationCode: row.requiredCertificationCode,
    minHeadcount: row.minHeadcount,
    maxHeadcount: row.maxHeadcount,
  };
}

/** HRM-SFT-016/017 — coverage compare window with staffing flags. */
export async function loadHrTimeSftCoverageCompareWindow(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  departmentId?: string;
  locationCode?: string;
  limit?: number;
  offset?: number;
}): Promise<HrSftCoverageCompareWindow> {
  const [requirements, assignments] = await Promise.all([
    listHrShiftCoverageRequirementsWindow(input),
    listHrShiftCoverageAssignmentSlices({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      departmentId: input.departmentId,
      locationCode: input.locationCode,
    }),
  ]);

  const rows = requirements.rows.map((requirement) =>
    computeCoverageCompareRow({
      requirement: toRequirementScope(requirement),
      assignments: assignments.map((assignment) => ({
        assignmentId: assignment.id,
        employeeId: assignment.employeeId,
        templateId: assignment.templateId,
        departmentId: assignment.departmentId,
        positionId: assignment.positionId,
        positionCode: assignment.positionCode,
        locationCode: assignment.locationCode,
        shiftDate: assignment.shiftDate,
        status: assignment.status,
        completedQualificationCodes: assignment.completedQualificationCodes,
      })),
    }),
  );

  return {
    rows,
    pageSize: requirements.pageSize,
    totalCount: requirements.totalCount,
    hasNextPage: requirements.hasNextPage,
  };
}

export async function createHrTimeSftCoverageRequirement(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftCreateCoverageRequirementInput;
}): Promise<{ requirementId: string }> {
  return createHrShiftCoverageRequirement({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    requirementDate: input.payload.requirementDate,
    templateId: input.payload.templateId,
    departmentId: input.payload.departmentId,
    positionId: input.payload.positionId,
    locationCode: input.payload.locationCode,
    roleCode: input.payload.roleCode,
    requiredSkillCode: input.payload.requiredSkillCode,
    requiredCertificationCode: input.payload.requiredCertificationCode,
    minHeadcount: input.payload.minHeadcount,
    maxHeadcount: input.payload.maxHeadcount,
    notes: input.payload.notes,
  });
}

export async function readHrTimeSftSchedulingPolicy(input: {
  organizationId: string;
}) {
  return getHrShiftSchedulingPolicy(input);
}

export type { HrShiftCoverageCompareWindow };
