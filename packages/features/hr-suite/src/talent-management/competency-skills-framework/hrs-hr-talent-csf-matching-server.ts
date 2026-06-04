import type { HrCsfMatchTargetKind } from "./hr.talent.csf-constants.shared";
import type { HrCsfEmployeeSkillMatch } from "./hr.talent.csf-integration.contract";
import {
  listHrCsfEmployeeProficienciesFromStore,
  listHrCsfRoleRequirementsFromStore,
  proficiencyIndex,
} from "./hr.talent.csf-store.shared";
import { emitHrCsfAuditTrailEvent } from "./hrs-hr-talent-csf-audit-server";
import { hrTalentCsfAuditActions } from "./hr.talent.csf-audit.event";

type MatchQuery = {
  organizationId: string;
  targetKind: HrCsfMatchTargetKind;
  targetCode: string;
  minMatchScorePct?: number;
  visibleEmployeeIds?: readonly string[] | null;
  actorAuthUserId?: string | null;
};

/** HRM-CSF-028 — identify employees matching required skills. */
export async function findEmployeesMatchingRequiredSkills(
  input: MatchQuery,
): Promise<HrCsfEmployeeSkillMatch[]> {
  const requirements = listHrCsfRoleRequirementsFromStore(input.organizationId).filter(
    (req) => {
      if (input.targetKind === "role" || input.targetKind === "critical_position") {
        return req.roleCode === input.targetCode;
      }
      return req.roleCode === input.targetCode;
    },
  );

  const skillRequirements = requirements.filter((req) => req.itemKind === "skill");
  if (skillRequirements.length === 0) {
    return [];
  }

  const proficiencies = listHrCsfEmployeeProficienciesFromStore(
    input.organizationId,
    input.visibleEmployeeIds,
  );

  const employees = new Map<
    string,
    {
      employeeDisplayName: string;
      employeeNumber: string;
      departmentName: string;
      matched: number;
      missingCritical: string[];
    }
  >();

  for (const prof of proficiencies) {
    if (!employees.has(prof.employeeId)) {
      employees.set(prof.employeeId, {
        employeeDisplayName: prof.employeeDisplayName,
        employeeNumber: prof.employeeNumber,
        departmentName: prof.departmentName,
        matched: 0,
        missingCritical: [],
      });
    }
  }

  for (const req of skillRequirements) {
    for (const [employeeId, bucket] of employees) {
      const prof = proficiencies.find(
        (row) => row.employeeId === employeeId && row.itemCode === req.itemCode,
      );
      const currentIndex = prof ? proficiencyIndex(prof.currentLevel) : -1;
      const requiredIndex = proficiencyIndex(req.requiredLevel);
      if (currentIndex >= requiredIndex) {
        bucket.matched += 1;
      } else if (req.requirementKind === "critical") {
        bucket.missingCritical.push(req.itemName);
      }
    }
  }

  const minScore = input.minMatchScorePct ?? 0;
  const results: HrCsfEmployeeSkillMatch[] = [];

  for (const [employeeId, bucket] of employees) {
    const matchScorePct = Math.round((bucket.matched / skillRequirements.length) * 100);
    if (matchScorePct < minScore) {
      continue;
    }
    results.push({
      employeeId,
      employeeDisplayName: bucket.employeeDisplayName,
      employeeNumber: bucket.employeeNumber,
      departmentName: bucket.departmentName,
      matchScorePct,
      matchedSkillCount: bucket.matched,
      requiredSkillCount: skillRequirements.length,
      missingCriticalSkills: bucket.missingCritical,
    });
  }

  results.sort((a, b) => b.matchScorePct - a.matchScorePct);

  await emitHrCsfAuditTrailEvent({
    organizationId: input.organizationId,
    action: hrTalentCsfAuditActions.matching.query,
    summary: `Skill match query for ${input.targetKind} ${input.targetCode}`,
    actorAuthUserId: input.actorAuthUserId,
    metadata: {
      targetKind: input.targetKind,
      targetCode: input.targetCode,
      resultCount: results.length,
    },
  });

  return results;
}

export function listHrCsfMatchingWindow(input: {
  organizationId: string;
  targetKind: HrCsfMatchTargetKind;
  targetCode: string;
  minMatchScorePct?: number;
  visibleEmployeeIds?: readonly string[] | null;
  actorAuthUserId?: string | null;
}) {
  return findEmployeesMatchingRequiredSkills(input);
}
