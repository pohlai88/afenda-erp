import type { HrCsfReportGroupBy } from "./hr.talent.csf-constants.shared";
import {
  listHrCsfEmployeeProficienciesFromStore,
  listHrCsfGapsFromStore,
} from "./hr.talent.csf-store.shared";

export type HrCsfReportRow = {
  id: string;
  groupKey: string;
  groupLabel: string;
  employeeCount: number;
  skillCount: number;
  competencyCount: number;
  gapCount: number;
  avgProficiencyIndex: number;
};

export type HrCsfReportFilter = {
  departmentName?: string | null;
  jobFamily?: string | null;
  grade?: string | null;
  roleCode?: string | null;
  proficiencyLevel?: string | null;
};

function groupLabelFor(
  groupBy: HrCsfReportGroupBy,
  row: {
    employeeDisplayName: string;
    roleName: string;
    departmentName: string;
    jobFamily: string;
    grade: string;
    currentLevel: string;
  },
): { key: string; label: string } {
  switch (groupBy) {
    case "employee":
      return { key: row.employeeDisplayName, label: row.employeeDisplayName };
    case "role":
      return { key: row.roleName, label: row.roleName };
    case "department":
      return { key: row.departmentName, label: row.departmentName };
    case "job_family":
      return { key: row.jobFamily, label: row.jobFamily };
    case "grade":
      return { key: row.grade, label: row.grade };
    case "proficiency":
      return { key: row.currentLevel, label: row.currentLevel };
    default:
      return { key: "unknown", label: "Unknown" };
  }
}

const proficiencyWeight: Record<string, number> = {
  beginner: 1,
  working: 2,
  competent: 3,
  advanced: 4,
  expert: 5,
};

/** HRM-CSF-029 — competency and skill report aggregation. */
export function buildHrCsfReportRows(input: {
  organizationId: string;
  groupBy: HrCsfReportGroupBy;
  filter?: HrCsfReportFilter;
  visibleEmployeeIds?: readonly string[] | null;
}): HrCsfReportRow[] {
  const proficiencies = listHrCsfEmployeeProficienciesFromStore(
    input.organizationId,
    input.visibleEmployeeIds,
  );
  const gaps = listHrCsfGapsFromStore(input.organizationId, input.visibleEmployeeIds);

  const filteredProficiencies = proficiencies.filter((row) => {
    if (input.filter?.departmentName && row.departmentName !== input.filter.departmentName) {
      return false;
    }
    if (input.filter?.jobFamily && row.jobFamily !== input.filter.jobFamily) {
      return false;
    }
    if (input.filter?.grade && row.grade !== input.filter.grade) {
      return false;
    }
    if (input.filter?.roleCode && row.roleCode !== input.filter.roleCode) {
      return false;
    }
    if (
      input.filter?.proficiencyLevel &&
      row.currentLevel !== input.filter.proficiencyLevel
    ) {
      return false;
    }
    return true;
  });

  const buckets = new Map<
    string,
    {
      label: string;
      employees: Set<string>;
      skills: number;
      competencies: number;
      gapCount: number;
      proficiencySum: number;
      proficiencyCount: number;
    }
  >();

  for (const row of filteredProficiencies) {
    const { key, label } = groupLabelFor(input.groupBy, row);
    const bucket = buckets.get(key) ?? {
      label,
      employees: new Set<string>(),
      skills: 0,
      competencies: 0,
      gapCount: 0,
      proficiencySum: 0,
      proficiencyCount: 0,
    };
    bucket.employees.add(row.employeeId);
    if (row.itemKind === "skill") {
      bucket.skills += 1;
    } else {
      bucket.competencies += 1;
    }
    bucket.proficiencySum += proficiencyWeight[row.currentLevel] ?? 0;
    bucket.proficiencyCount += 1;
    buckets.set(key, bucket);
  }

  for (const gap of gaps) {
    const { key, label } = groupLabelFor(input.groupBy, {
      employeeDisplayName: gap.employeeDisplayName,
      roleName: gap.roleCode,
      departmentName: gap.departmentName,
      jobFamily: gap.jobFamily,
      grade: gap.grade,
      currentLevel: gap.currentLevel,
    });
    const bucket = buckets.get(key) ?? {
      label,
      employees: new Set<string>([gap.employeeId]),
      skills: 0,
      competencies: 0,
      gapCount: 0,
      proficiencySum: 0,
      proficiencyCount: 0,
    };
    bucket.gapCount += 1;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()].map(([groupKey, bucket]) => ({
    id: groupKey,
    groupKey,
    groupLabel: bucket.label,
    employeeCount: bucket.employees.size,
    skillCount: bucket.skills,
    competencyCount: bucket.competencies,
    gapCount: bucket.gapCount,
    avgProficiencyIndex:
      bucket.proficiencyCount > 0
        ? Number((bucket.proficiencySum / bucket.proficiencyCount).toFixed(2))
        : 0,
  }));
}

export function filterHrCsfReportRows(
  rows: readonly HrCsfReportRow[],
  search?: string,
): HrCsfReportRow[] {
  const trimmed = search?.trim().toLowerCase();
  if (!trimmed) {
    return [...rows];
  }
  return rows.filter((row) =>
    [row.groupLabel, row.groupKey].join(" ").toLowerCase().includes(trimmed),
  );
}
