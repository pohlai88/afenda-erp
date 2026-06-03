/** HRM-SFT-016/017/018 — pure coverage compare and assignment qualification helpers. */

export type HrShiftCoverageStaffingStatus =
  | "balanced"
  | "understaffed"
  | "overstaffed";

export type HrShiftCoverageRequirementScope = {
  readonly requirementId: string;
  readonly requirementDate: Date;
  readonly templateId: string | null;
  readonly templateCode: string | null;
  readonly templateName: string | null;
  readonly departmentId: string | null;
  readonly departmentName: string | null;
  readonly positionId: string | null;
  readonly positionCode: string | null;
  readonly locationCode: string | null;
  readonly roleCode: string | null;
  readonly requiredSkillCode: string | null;
  readonly requiredCertificationCode: string | null;
  readonly minHeadcount: number;
  readonly maxHeadcount: number | null;
};

export type HrShiftCoverageAssignmentSlice = {
  readonly assignmentId: string;
  readonly employeeId: string;
  readonly templateId: string;
  readonly departmentId: string | null;
  readonly positionId: string | null;
  readonly positionCode: string | null;
  readonly locationCode: string | null;
  readonly shiftDate: Date;
  readonly status: string;
  readonly completedQualificationCodes: readonly string[];
};

export type HrShiftCoverageCompareRow = HrShiftCoverageRequirementScope & {
  readonly assignedHeadcount: number;
  readonly deltaHeadcount: number;
  readonly staffingStatus: HrShiftCoverageStaffingStatus;
  readonly qualificationGapCount: number;
};

export type HrShiftAssignmentCoverageValidation = {
  readonly eligible: boolean;
  readonly reasons: readonly string[];
};

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function assignmentIsActive(status: string): boolean {
  return status === "scheduled" || status === "published";
}

export function employeeMeetsCoverageQualification(input: {
  assignment: Pick<
    HrShiftCoverageAssignmentSlice,
    "positionCode" | "completedQualificationCodes"
  >;
  requirement: Pick<
    HrShiftCoverageRequirementScope,
    "roleCode" | "requiredSkillCode" | "requiredCertificationCode"
  >;
}): boolean {
  const codes = new Set(
    input.assignment.completedQualificationCodes.map((code) => code.trim()),
  );
  if (input.requirement.roleCode?.trim()) {
    const role = input.requirement.roleCode.trim();
    if (input.assignment.positionCode !== role && !codes.has(role)) {
      return false;
    }
  }
  if (input.requirement.requiredSkillCode?.trim()) {
    if (!codes.has(input.requirement.requiredSkillCode.trim())) {
      return false;
    }
  }
  if (input.requirement.requiredCertificationCode?.trim()) {
    if (!codes.has(input.requirement.requiredCertificationCode.trim())) {
      return false;
    }
  }
  return true;
}

export function assignmentMatchesCoverageScope(
  assignment: HrShiftCoverageAssignmentSlice,
  requirement: HrShiftCoverageRequirementScope,
): boolean {
  if (!assignmentIsActive(assignment.status)) {
    return false;
  }
  if (utcDayKey(assignment.shiftDate) !== utcDayKey(requirement.requirementDate)) {
    return false;
  }
  if (
    requirement.templateId &&
    assignment.templateId !== requirement.templateId
  ) {
    return false;
  }
  if (
    requirement.departmentId &&
    assignment.departmentId !== requirement.departmentId
  ) {
    return false;
  }
  if (
    requirement.positionId &&
    assignment.positionId !== requirement.positionId
  ) {
    return false;
  }
  if (
    requirement.locationCode?.trim() &&
    assignment.locationCode?.trim() !== requirement.locationCode.trim()
  ) {
    return false;
  }
  if (!employeeMeetsCoverageQualification({ assignment, requirement })) {
    return false;
  }
  return true;
}

export function resolveCoverageStaffingStatus(input: {
  assignedHeadcount: number;
  minHeadcount: number;
  maxHeadcount: number | null;
}): HrShiftCoverageStaffingStatus {
  if (input.assignedHeadcount < input.minHeadcount) {
    return "understaffed";
  }
  if (
    input.maxHeadcount !== null &&
    input.assignedHeadcount > input.maxHeadcount
  ) {
    return "overstaffed";
  }
  return "balanced";
}

export function computeCoverageCompareRow(input: {
  requirement: HrShiftCoverageRequirementScope;
  assignments: readonly HrShiftCoverageAssignmentSlice[];
}): HrShiftCoverageCompareRow {
  const matching = input.assignments.filter((assignment) =>
    assignmentMatchesCoverageScope(assignment, input.requirement),
  );
  const assignedHeadcount = matching.length;
  const deltaHeadcount = assignedHeadcount - input.requirement.minHeadcount;
  const staffingStatus = resolveCoverageStaffingStatus({
    assignedHeadcount,
    minHeadcount: input.requirement.minHeadcount,
    maxHeadcount: input.requirement.maxHeadcount,
  });
  const qualificationGapCount = matching.filter(
    (assignment) =>
      !employeeMeetsCoverageQualification({
        assignment,
        requirement: input.requirement,
      }),
  ).length;

  return {
    ...input.requirement,
    assignedHeadcount,
    deltaHeadcount,
    staffingStatus,
    qualificationGapCount,
  };
}

/** HRM-SFT-018 — validate a proposed assignment against active coverage rules. */
export function validateAssignmentAgainstCoverageRequirements(input: {
  assignment: HrShiftCoverageAssignmentSlice;
  requirements: readonly HrShiftCoverageRequirementScope[];
}): HrShiftAssignmentCoverageValidation {
  const reasons: string[] = [];
  const applicable = input.requirements.filter((requirement) =>
    assignmentMatchesCoverageScope(
      { ...input.assignment, status: "scheduled" },
      requirement,
    ),
  );

  for (const requirement of applicable) {
    if (
      !employeeMeetsCoverageQualification({
        assignment: input.assignment,
        requirement,
      })
    ) {
      const missing: string[] = [];
      if (requirement.roleCode?.trim()) {
        missing.push(`role ${requirement.roleCode.trim()}`);
      }
      if (requirement.requiredSkillCode?.trim()) {
        missing.push(`skill ${requirement.requiredSkillCode.trim()}`);
      }
      if (requirement.requiredCertificationCode?.trim()) {
        missing.push(
          `certification ${requirement.requiredCertificationCode.trim()}`,
        );
      }
      reasons.push(
        `Missing required coverage qualification (${missing.join(", ") || "unspecified"}).`,
      );
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export function formatCoverageStaffingStatusLabel(
  status: HrShiftCoverageStaffingStatus,
): string {
  switch (status) {
    case "understaffed":
      return "Understaffed";
    case "overstaffed":
      return "Overstaffed";
    default:
      return "Balanced";
  }
}
