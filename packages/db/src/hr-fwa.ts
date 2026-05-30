import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  hrDepartments,
  hrEmployees,
  hrFwaArrangementKindEnum,
  hrFwaArrangements,
  hrFwaArrangementStatusEnum,
  hrFwaArrangementTypeConfigs,
  hrFwaAuditEvents,
  hrFwaEligibilityRules,
  hrFwaNotifications,
  hrFwaPolicyGroups,
  hrFwaRemoteLocations,
  hrFwaRequests,
  hrFwaSchedulePatterns,
  hrPositions,
  type HrFwaSchedulePatternDetails,
} from "./schema/hr";

export type HrFwaArrangementKind =
  (typeof hrFwaArrangementKindEnum.enumValues)[number];

export type HrFwaArrangementStatus =
  (typeof hrFwaArrangementStatusEnum.enumValues)[number];

export type HrFwaPolicyGroupRow = {
  id: string;
  code: string;
  label: string;
  description: string | null;
  minOfficeDaysPerWeek: number | null;
  maxRemoteDaysPerWeek: number | null;
  requireHrApproval: boolean;
  requireDepartmentApproval: boolean;
  allowExceptionApproval: boolean;
  active: boolean;
};

export type HrFwaArrangementTypeConfigRow = {
  id: string;
  policyGroupCode: string;
  arrangementKind: HrFwaArrangementKind;
  label: string;
  description: string | null;
  requiresSupportingDocument: boolean;
  requiresRemoteLocation: boolean;
  minDurationDays: number | null;
  maxDurationDays: number | null;
  active: boolean;
};

export type HrFwaEligibilityRuleRow = {
  id: string;
  policyGroupCode: string;
  arrangementKind: HrFwaArrangementKind | null;
  legalEntityCode: string | null;
  countryCode: string | null;
  workLocationCode: string | null;
  departmentId: string | null;
  roleCode: string | null;
  grade: string | null;
  employmentType: string | null;
  employeeCategory: string | null;
  eligible: boolean;
  requiresExceptionApproval: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type HrFwaEligibilityResult = {
  eligible: boolean;
  requiresExceptionApproval: boolean;
  matchedRuleId: string | null;
  reason: string;
};

export type HrFwaArrangementRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  requestId: string | null;
  arrangementKind: HrFwaArrangementKind;
  policyGroupCode: string;
  status: HrFwaArrangementStatus;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  reviewDate: Date | null;
  renewalDate: Date | null;
  schedulePatternId: string | null;
  remoteLocationId: string | null;
  exceptionApproved: boolean;
  payrollReference: string | null;
};

export type HrFwaArrangementWindow = {
  rows: readonly HrFwaArrangementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrFwaRemoteLocationRow = {
  id: string;
  employeeId: string;
  label: string;
  locationKind: string;
  countryCode: string | null;
  regionCode: string | null;
  addressLine: string | null;
  isApproved: boolean;
  approvedAt: Date | null;
};

export class HrFwaCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "policy_group_not_found"
    | "arrangement_type_not_configured"
    | "arrangement_type_inactive"
    | "not_eligible"
    | "supporting_document_required"
    | "remote_location_required"
    | "invalid_date_range"
    | "schedule_pattern_not_found"
    | "remote_location_not_found"
    | "remote_location_not_approved"
    | "arrangement_not_found"
    | "request_not_found";

  constructor(code: HrFwaCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

function ruleSpecificityScore(rule: HrFwaEligibilityRuleRow): number {
  let score = 0;
  if (rule.legalEntityCode) score += 256;
  if (rule.countryCode) score += 128;
  if (rule.workLocationCode) score += 64;
  if (rule.departmentId) score += 32;
  if (rule.roleCode) score += 16;
  if (rule.grade) score += 8;
  if (rule.employmentType) score += 4;
  if (rule.employeeCategory) score += 2;
  if (rule.arrangementKind) score += 1;
  return score;
}

function matchesEligibilityRule(
  rule: HrFwaEligibilityRuleRow,
  context: {
    arrangementKind: HrFwaArrangementKind;
    legalEntityCode: string | null;
    countryCode: string | null;
    workLocationCode: string | null;
    departmentId: string | null;
    roleCode: string | null;
    grade: string | null;
    employmentType: string | null;
    employeeCategory: string | null;
    asOf: Date;
  },
): boolean {
  if (rule.effectiveFrom.getTime() > context.asOf.getTime()) {
    return false;
  }
  if (rule.effectiveTo && rule.effectiveTo.getTime() < context.asOf.getTime()) {
    return false;
  }
  if (rule.arrangementKind && rule.arrangementKind !== context.arrangementKind) {
    return false;
  }
  if (
    rule.legalEntityCode &&
    rule.legalEntityCode !== context.legalEntityCode
  ) {
    return false;
  }
  if (rule.countryCode && rule.countryCode !== context.countryCode) {
    return false;
  }
  if (
    rule.workLocationCode &&
    rule.workLocationCode !== context.workLocationCode
  ) {
    return false;
  }
  if (rule.departmentId && rule.departmentId !== context.departmentId) {
    return false;
  }
  if (rule.roleCode && rule.roleCode !== context.roleCode) {
    return false;
  }
  if (rule.grade && rule.grade !== context.grade) {
    return false;
  }
  if (rule.employmentType && rule.employmentType !== context.employmentType) {
    return false;
  }
  if (
    rule.employeeCategory &&
    rule.employeeCategory !== context.employeeCategory
  ) {
    return false;
  }
  return true;
}

async function loadEmployeeFwaContext(
  organizationId: string,
  employeeId: string,
): Promise<{
  id: string;
  legalEntityCode: string | null;
  countryCode: string | null;
  workLocationCode: string | null;
  currentDepartmentId: string | null;
  currentPositionId: string | null;
  grade: string | null;
  employmentType: string | null;
  workerCategory: string | null;
  roleCode: string | null;
}> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [employee] = await db
      .select({
        id: hrEmployees.id,
        legalEntityCode: hrEmployees.legalEntityCode,
        countryCode: hrEmployees.countryCode,
        workLocationCode: hrEmployees.workLocationCode,
        currentDepartmentId: hrEmployees.currentDepartmentId,
        currentPositionId: hrEmployees.currentPositionId,
        grade: hrEmployees.grade,
        employmentType: hrEmployees.employmentType,
        workerCategory: hrEmployees.workerCategory,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, organizationId),
          eq(hrEmployees.id, employeeId),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new HrFwaCommandError("employee_not_found");
    }

    let roleCode: string | null = null;
    if (employee.currentPositionId) {
      const [position] = await db
        .select({ code: hrPositions.code })
        .from(hrPositions)
        .where(eq(hrPositions.id, employee.currentPositionId))
        .limit(1);
      roleCode = position?.code ?? null;
    }

    return { ...employee, roleCode };
  });
}

export async function listHrFwaPolicyGroups(input: {
  organizationId: string;
  activeOnly?: boolean;
}): Promise<readonly HrFwaPolicyGroupRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrFwaPolicyGroups.organizationId, input.organizationId),
    ];
    if (input.activeOnly !== false) {
      conditions.push(eq(hrFwaPolicyGroups.active, true));
    }

    const rows = await db
      .select()
      .from(hrFwaPolicyGroups)
      .where(and(...conditions))
      .orderBy(hrFwaPolicyGroups.code);

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      label: row.label,
      description: row.description,
      minOfficeDaysPerWeek: row.minOfficeDaysPerWeek,
      maxRemoteDaysPerWeek: row.maxRemoteDaysPerWeek,
      requireHrApproval: row.requireHrApproval,
      requireDepartmentApproval: row.requireDepartmentApproval,
      allowExceptionApproval: row.allowExceptionApproval,
      active: row.active,
    }));
  });
}

export async function upsertHrFwaPolicyGroup(input: {
  organizationId: string;
  code: string;
  label: string;
  description?: string | null;
  minOfficeDaysPerWeek?: number | null;
  maxRemoteDaysPerWeek?: number | null;
  requireHrApproval?: boolean;
  requireDepartmentApproval?: boolean;
  allowExceptionApproval?: boolean;
  active?: boolean;
}): Promise<{ policyGroupId: string }> {
  const code = input.code.trim();
  if (!code) {
    throw new HrFwaCommandError("policy_group_not_found", "Policy group code required");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrFwaPolicyGroups.id })
      .from(hrFwaPolicyGroups)
      .where(
        and(
          eq(hrFwaPolicyGroups.organizationId, input.organizationId),
          eq(hrFwaPolicyGroups.code, code),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrFwaPolicyGroups)
        .set({
          label: input.label.trim(),
          description: input.description?.trim() || null,
          minOfficeDaysPerWeek: input.minOfficeDaysPerWeek ?? null,
          maxRemoteDaysPerWeek: input.maxRemoteDaysPerWeek ?? null,
          requireHrApproval: input.requireHrApproval ?? true,
          requireDepartmentApproval: input.requireDepartmentApproval ?? false,
          allowExceptionApproval: input.allowExceptionApproval ?? true,
          active: input.active ?? true,
        })
        .where(eq(hrFwaPolicyGroups.id, existing.id));
      return { policyGroupId: existing.id };
    }

    const policyGroupId = createEntityId("hr_fwa_pol");
    await db.insert(hrFwaPolicyGroups).values({
      id: policyGroupId,
      organizationId: input.organizationId,
      code,
      label: input.label.trim(),
      description: input.description?.trim() || null,
      minOfficeDaysPerWeek: input.minOfficeDaysPerWeek ?? null,
      maxRemoteDaysPerWeek: input.maxRemoteDaysPerWeek ?? null,
      requireHrApproval: input.requireHrApproval ?? true,
      requireDepartmentApproval: input.requireDepartmentApproval ?? false,
      allowExceptionApproval: input.allowExceptionApproval ?? true,
      active: input.active ?? true,
    });
    return { policyGroupId };
  });
}

export async function getOrCreateDefaultHrFwaPolicyGroup(input: {
  organizationId: string;
}): Promise<HrFwaPolicyGroupRow> {
  const groups = await listHrFwaPolicyGroups({
    organizationId: input.organizationId,
    activeOnly: false,
  });
  const existing = groups.find((group) => group.code === "default");
  if (existing) {
    return existing;
  }

  const { policyGroupId } = await upsertHrFwaPolicyGroup({
    organizationId: input.organizationId,
    code: "default",
    label: "Default FWA Policy",
  });

  const created = (await listHrFwaPolicyGroups({
    organizationId: input.organizationId,
    activeOnly: false,
  })).find((group) => group.id === policyGroupId);

  if (!created) {
    throw new HrFwaCommandError("policy_group_not_found");
  }
  return created;
}

/** HRM-FWA-001 — list configured arrangement types. */
export async function listHrFwaArrangementTypeConfigs(input: {
  organizationId: string;
  policyGroupCode?: string;
  activeOnly?: boolean;
}): Promise<readonly HrFwaArrangementTypeConfigRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrFwaArrangementTypeConfigs.organizationId, input.organizationId),
    ];
    if (input.policyGroupCode) {
      conditions.push(
        eq(hrFwaArrangementTypeConfigs.policyGroupCode, input.policyGroupCode),
      );
    }
    if (input.activeOnly !== false) {
      conditions.push(eq(hrFwaArrangementTypeConfigs.active, true));
    }

    const rows = await db
      .select()
      .from(hrFwaArrangementTypeConfigs)
      .where(and(...conditions))
      .orderBy(
        hrFwaArrangementTypeConfigs.policyGroupCode,
        hrFwaArrangementTypeConfigs.arrangementKind,
      );

    return rows.map((row) => ({
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      arrangementKind: row.arrangementKind,
      label: row.label,
      description: row.description,
      requiresSupportingDocument: row.requiresSupportingDocument,
      requiresRemoteLocation: row.requiresRemoteLocation,
      minDurationDays: row.minDurationDays,
      maxDurationDays: row.maxDurationDays,
      active: row.active,
    }));
  });
}

/** HRM-FWA-001 — create or update arrangement type configuration. */
export async function upsertHrFwaArrangementTypeConfig(input: {
  organizationId: string;
  policyGroupCode?: string;
  arrangementKind: HrFwaArrangementKind;
  label: string;
  description?: string | null;
  requiresSupportingDocument?: boolean;
  requiresRemoteLocation?: boolean;
  minDurationDays?: number | null;
  maxDurationDays?: number | null;
  active?: boolean;
}): Promise<{ configId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrFwaArrangementTypeConfigs.id })
      .from(hrFwaArrangementTypeConfigs)
      .where(
        and(
          eq(hrFwaArrangementTypeConfigs.organizationId, input.organizationId),
          eq(hrFwaArrangementTypeConfigs.policyGroupCode, policyGroupCode),
          eq(
            hrFwaArrangementTypeConfigs.arrangementKind,
            input.arrangementKind,
          ),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrFwaArrangementTypeConfigs)
        .set({
          label: input.label.trim(),
          description: input.description?.trim() || null,
          requiresSupportingDocument: input.requiresSupportingDocument ?? false,
          requiresRemoteLocation: input.requiresRemoteLocation ?? false,
          minDurationDays: input.minDurationDays ?? null,
          maxDurationDays: input.maxDurationDays ?? null,
          active: input.active ?? true,
        })
        .where(eq(hrFwaArrangementTypeConfigs.id, existing.id));
      return { configId: existing.id };
    }

    const configId = createEntityId("hr_fwa_type");
    await db.insert(hrFwaArrangementTypeConfigs).values({
      id: configId,
      organizationId: input.organizationId,
      policyGroupCode,
      arrangementKind: input.arrangementKind,
      label: input.label.trim(),
      description: input.description?.trim() || null,
      requiresSupportingDocument: input.requiresSupportingDocument ?? false,
      requiresRemoteLocation: input.requiresRemoteLocation ?? false,
      minDurationDays: input.minDurationDays ?? null,
      maxDurationDays: input.maxDurationDays ?? null,
      active: input.active ?? true,
    });
    return { configId };
  });
}

/** HRM-FWA-003 — list eligibility rules. */
export async function listHrFwaEligibilityRules(input: {
  organizationId: string;
  policyGroupCode?: string;
  arrangementKind?: HrFwaArrangementKind;
}): Promise<readonly HrFwaEligibilityRuleRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrFwaEligibilityRules.organizationId, input.organizationId),
    ];
    if (input.policyGroupCode) {
      conditions.push(
        eq(hrFwaEligibilityRules.policyGroupCode, input.policyGroupCode),
      );
    }
    if (input.arrangementKind) {
      conditions.push(
        eq(hrFwaEligibilityRules.arrangementKind, input.arrangementKind),
      );
    }

    const rows = await db
      .select()
      .from(hrFwaEligibilityRules)
      .where(and(...conditions))
      .orderBy(desc(hrFwaEligibilityRules.effectiveFrom));

    return rows.map((row) => ({
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      arrangementKind: row.arrangementKind,
      legalEntityCode: row.legalEntityCode,
      countryCode: row.countryCode,
      workLocationCode: row.workLocationCode,
      departmentId: row.departmentId,
      roleCode: row.roleCode,
      grade: row.grade,
      employmentType: row.employmentType,
      employeeCategory: row.employeeCategory,
      eligible: row.eligible,
      requiresExceptionApproval: row.requiresExceptionApproval,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
    }));
  });
}

/** HRM-FWA-003 — create eligibility rule. */
export async function createHrFwaEligibilityRule(input: {
  organizationId: string;
  policyGroupCode?: string;
  arrangementKind?: HrFwaArrangementKind | null;
  legalEntityCode?: string | null;
  countryCode?: string | null;
  workLocationCode?: string | null;
  departmentId?: string | null;
  roleCode?: string | null;
  grade?: string | null;
  employmentType?: string | null;
  employeeCategory?: string | null;
  eligible?: boolean;
  requiresExceptionApproval?: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
}): Promise<{ ruleId: string }> {
  const ruleId = createEntityId("hr_fwa_elig");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrFwaEligibilityRules).values({
      id: ruleId,
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode ?? "default",
      arrangementKind: input.arrangementKind ?? null,
      legalEntityCode: input.legalEntityCode ?? null,
      countryCode: input.countryCode ?? null,
      workLocationCode: input.workLocationCode ?? null,
      departmentId: input.departmentId ?? null,
      roleCode: input.roleCode ?? null,
      grade: input.grade ?? null,
      employmentType: input.employmentType ?? null,
      employeeCategory: input.employeeCategory ?? null,
      eligible: input.eligible ?? true,
      requiresExceptionApproval: input.requiresExceptionApproval ?? false,
      effectiveFrom: input.effectiveFrom ?? new Date(),
      effectiveTo: input.effectiveTo ?? null,
    });
  });
  return { ruleId };
}

/** HRM-FWA-003 / FWA-007 — resolve employee eligibility for an arrangement kind. */
export async function evaluateHrFwaEmployeeEligibility(input: {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKind;
  policyGroupCode?: string;
  asOf?: Date;
}): Promise<HrFwaEligibilityResult> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  const asOf = input.asOf ?? new Date();

  const employee = await loadEmployeeFwaContext(
    input.organizationId,
    input.employeeId,
  );

  const rules = await listHrFwaEligibilityRules({
    organizationId: input.organizationId,
    policyGroupCode,
    arrangementKind: input.arrangementKind,
  });

  const context = {
    arrangementKind: input.arrangementKind,
    legalEntityCode: employee.legalEntityCode,
    countryCode: employee.countryCode,
    workLocationCode: employee.workLocationCode,
    departmentId: employee.currentDepartmentId,
    roleCode: employee.roleCode,
    grade: employee.grade,
    employmentType: employee.employmentType,
    employeeCategory: employee.workerCategory,
    asOf,
  };

  const matching = rules
    .filter((rule) => matchesEligibilityRule(rule, context))
    .sort((a, b) => ruleSpecificityScore(b) - ruleSpecificityScore(a));

  const best = matching[0];
  if (!best) {
    return {
      eligible: false,
      requiresExceptionApproval: true,
      matchedRuleId: null,
      reason: "No matching eligibility rule",
    };
  }

  if (!best.eligible) {
    return {
      eligible: false,
      requiresExceptionApproval: best.requiresExceptionApproval,
      matchedRuleId: best.id,
      reason: "Employee matched an ineligible rule",
    };
  }

  return {
    eligible: true,
    requiresExceptionApproval: best.requiresExceptionApproval,
    matchedRuleId: best.id,
    reason: "Employee matched eligible rule",
  };
}

export async function createHrFwaSchedulePattern(input: {
  organizationId: string;
  employeeId?: string | null;
  label?: string | null;
  patternDetails: HrFwaSchedulePatternDetails;
}): Promise<{ schedulePatternId: string }> {
  if (input.employeeId) {
    await loadEmployeeFwaContext(input.organizationId, input.employeeId);
  }

  const schedulePatternId = createEntityId("hr_fwa_sched");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrFwaSchedulePatterns).values({
      id: schedulePatternId,
      organizationId: input.organizationId,
      employeeId: input.employeeId ?? null,
      label: input.label?.trim() || null,
      patternDetails: input.patternDetails,
    });
  });
  return { schedulePatternId };
}

export async function getHrFwaSchedulePattern(input: {
  organizationId: string;
  schedulePatternId: string;
}): Promise<{
  id: string;
  employeeId: string | null;
  label: string | null;
  patternDetails: HrFwaSchedulePatternDetails;
}> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrFwaSchedulePatterns)
      .where(
        and(
          eq(hrFwaSchedulePatterns.organizationId, input.organizationId),
          eq(hrFwaSchedulePatterns.id, input.schedulePatternId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrFwaCommandError("schedule_pattern_not_found");
    }

    return {
      id: row.id,
      employeeId: row.employeeId,
      label: row.label,
      patternDetails: row.patternDetails,
    };
  });
}

export async function listHrFwaRemoteLocations(input: {
  organizationId: string;
  employeeId?: string;
  approvedOnly?: boolean;
}): Promise<readonly HrFwaRemoteLocationRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrFwaRemoteLocations.organizationId, input.organizationId),
    ];
    if (input.employeeId) {
      conditions.push(eq(hrFwaRemoteLocations.employeeId, input.employeeId));
    }
    if (input.approvedOnly) {
      conditions.push(eq(hrFwaRemoteLocations.isApproved, true));
    }

    const rows = await db
      .select()
      .from(hrFwaRemoteLocations)
      .where(and(...conditions))
      .orderBy(desc(hrFwaRemoteLocations.createdAt));

    return rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      label: row.label,
      locationKind: row.locationKind,
      countryCode: row.countryCode,
      regionCode: row.regionCode,
      addressLine: row.addressLine,
      isApproved: row.isApproved,
      approvedAt: row.approvedAt,
    }));
  });
}

export async function upsertHrFwaRemoteLocation(input: {
  organizationId: string;
  employeeId: string;
  label: string;
  locationKind?: (typeof import("./schema/hr").hrFwaRemoteLocationKindEnum.enumValues)[number];
  countryCode?: string | null;
  regionCode?: string | null;
  addressLine?: string | null;
  isApproved?: boolean;
  approvedByAuthUserId?: string | null;
  restrictionNotes?: string | null;
  remoteLocationId?: string;
}): Promise<{ remoteLocationId: string }> {
  await loadEmployeeFwaContext(input.organizationId, input.employeeId);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const approved = input.isApproved ?? false;

    if (input.remoteLocationId) {
      const [existing] = await db
        .select({ id: hrFwaRemoteLocations.id })
        .from(hrFwaRemoteLocations)
        .where(
          and(
            eq(hrFwaRemoteLocations.organizationId, input.organizationId),
            eq(hrFwaRemoteLocations.id, input.remoteLocationId),
            eq(hrFwaRemoteLocations.employeeId, input.employeeId),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new HrFwaCommandError("remote_location_not_found");
      }

      await db
        .update(hrFwaRemoteLocations)
        .set({
          label: input.label.trim(),
          locationKind: input.locationKind ?? "home_office",
          countryCode: input.countryCode ?? null,
          regionCode: input.regionCode ?? null,
          addressLine: input.addressLine?.trim() || null,
          isApproved: approved,
          approvedAt: approved ? new Date() : null,
          approvedByAuthUserId: approved
            ? input.approvedByAuthUserId ?? null
            : null,
          restrictionNotes: input.restrictionNotes?.trim() || null,
        })
        .where(eq(hrFwaRemoteLocations.id, existing.id));

      return { remoteLocationId: existing.id };
    }

    const remoteLocationId = createEntityId("hr_fwa_loc");
    await db.insert(hrFwaRemoteLocations).values({
      id: remoteLocationId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      label: input.label.trim(),
      locationKind: input.locationKind ?? "home_office",
      countryCode: input.countryCode ?? null,
      regionCode: input.regionCode ?? null,
      addressLine: input.addressLine?.trim() || null,
      isApproved: approved,
      approvedAt: approved ? new Date() : null,
      approvedByAuthUserId: approved ? input.approvedByAuthUserId ?? null : null,
      restrictionNotes: input.restrictionNotes?.trim() || null,
    });
    return { remoteLocationId };
  });
}

export async function assertHrFwaRemoteLocationApproved(input: {
  organizationId: string;
  remoteLocationId: string;
  employeeId: string;
}): Promise<void> {
  const locations = await listHrFwaRemoteLocations({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    approvedOnly: true,
  });
  const match = locations.find((loc) => loc.id === input.remoteLocationId);
  if (!match) {
    throw new HrFwaCommandError("remote_location_not_approved");
  }
}

export async function listHrFwaArrangementsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  status?: HrFwaArrangementStatus;
  arrangementKind?: HrFwaArrangementKind;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}): Promise<HrFwaArrangementWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrFwaArrangements.organizationId, input.organizationId),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrFwaArrangements.employeeId, input.employeeId));
    }
    if (input.status) {
      conditions.push(eq(hrFwaArrangements.status, input.status));
    }
    if (input.arrangementKind) {
      conditions.push(
        eq(hrFwaArrangements.arrangementKind, input.arrangementKind),
      );
    }
    if (input.effectiveFrom) {
      conditions.push(
        gte(hrFwaArrangements.effectiveFrom, input.effectiveFrom),
      );
    }
    if (input.effectiveTo) {
      conditions.push(lte(hrFwaArrangements.effectiveTo, input.effectiveTo));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrFwaArrangements)
      .innerJoin(hrEmployees, eq(hrFwaArrangements.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrFwaArrangements.id,
        employeeId: hrFwaArrangements.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        requestId: hrFwaArrangements.requestId,
        arrangementKind: hrFwaArrangements.arrangementKind,
        policyGroupCode: hrFwaArrangements.policyGroupCode,
        status: hrFwaArrangements.status,
        effectiveFrom: hrFwaArrangements.effectiveFrom,
        effectiveTo: hrFwaArrangements.effectiveTo,
        reviewDate: hrFwaArrangements.reviewDate,
        renewalDate: hrFwaArrangements.renewalDate,
        schedulePatternId: hrFwaArrangements.schedulePatternId,
        remoteLocationId: hrFwaArrangements.remoteLocationId,
        exceptionApproved: hrFwaArrangements.exceptionApproved,
        payrollReference: hrFwaArrangements.payrollReference,
      })
      .from(hrFwaArrangements)
      .innerJoin(hrEmployees, eq(hrFwaArrangements.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrFwaArrangements.effectiveFrom))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        requestId: row.requestId,
        arrangementKind: row.arrangementKind,
        policyGroupCode: row.policyGroupCode,
        status: row.status,
        effectiveFrom: row.effectiveFrom,
        effectiveTo: row.effectiveTo,
        reviewDate: row.reviewDate,
        renewalDate: row.renewalDate,
        schedulePatternId: row.schedulePatternId,
        remoteLocationId: row.remoteLocationId,
        exceptionApproved: row.exceptionApproved,
        payrollReference: row.payrollReference,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function getHrFwaArrangementById(input: {
  organizationId: string;
  arrangementId: string;
}): Promise<HrFwaArrangementRow> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrFwaArrangements.id,
        employeeId: hrFwaArrangements.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        requestId: hrFwaArrangements.requestId,
        arrangementKind: hrFwaArrangements.arrangementKind,
        policyGroupCode: hrFwaArrangements.policyGroupCode,
        status: hrFwaArrangements.status,
        effectiveFrom: hrFwaArrangements.effectiveFrom,
        effectiveTo: hrFwaArrangements.effectiveTo,
        reviewDate: hrFwaArrangements.reviewDate,
        renewalDate: hrFwaArrangements.renewalDate,
        schedulePatternId: hrFwaArrangements.schedulePatternId,
        remoteLocationId: hrFwaArrangements.remoteLocationId,
        exceptionApproved: hrFwaArrangements.exceptionApproved,
        payrollReference: hrFwaArrangements.payrollReference,
      })
      .from(hrFwaArrangements)
      .innerJoin(hrEmployees, eq(hrFwaArrangements.employeeId, hrEmployees.id))
      .where(
        and(
          eq(hrFwaArrangements.organizationId, input.organizationId),
          eq(hrFwaArrangements.id, input.arrangementId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrFwaCommandError("arrangement_not_found");
    }

    return {
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.preferredName?.trim() || row.legalName,
      requestId: row.requestId,
      arrangementKind: row.arrangementKind,
      policyGroupCode: row.policyGroupCode,
      status: row.status,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      reviewDate: row.reviewDate,
      renewalDate: row.renewalDate,
      schedulePatternId: row.schedulePatternId,
      remoteLocationId: row.remoteLocationId,
      exceptionApproved: row.exceptionApproved,
      payrollReference: row.payrollReference,
    };
  });
}

export async function appendHrFwaAuditEvent(input: {
  organizationId: string;
  action: (typeof import("./schema/hr").hrFwaAuditActionEnum.enumValues)[number];
  summary: string;
  arrangementId?: string | null;
  requestId?: string | null;
  employeeId?: string | null;
  actorAuthUserId?: string | null;
  actorEmployeeId?: string | null;
  metadata?: Record<string, unknown> | null;
  occurredAt?: Date;
}): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_fwa_audit");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrFwaAuditEvents).values({
      id: auditEventId,
      organizationId: input.organizationId,
      arrangementId: input.arrangementId ?? null,
      requestId: input.requestId ?? null,
      employeeId: input.employeeId ?? null,
      action: input.action,
      actorAuthUserId: input.actorAuthUserId ?? null,
      actorEmployeeId: input.actorEmployeeId ?? null,
      summary: input.summary.trim(),
      metadata: input.metadata ?? null,
      occurredAt: input.occurredAt ?? new Date(),
    });
  });
  return { auditEventId };
}

export async function validateHrFwaRequestPrerequisites(input: {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKind;
  policyGroupCode?: string;
  startDate: Date;
  endDate?: Date | null;
  supportingDocumentId?: string | null;
  remoteLocationId?: string | null;
  exceptionRequested?: boolean;
}): Promise<HrFwaEligibilityResult> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  if (
    input.endDate &&
    input.endDate.getTime() < input.startDate.getTime()
  ) {
    throw new HrFwaCommandError("invalid_date_range");
  }

  const typeConfigs = await listHrFwaArrangementTypeConfigs({
    organizationId: input.organizationId,
    policyGroupCode,
    activeOnly: true,
  });
  const typeConfig = typeConfigs.find(
    (config) => config.arrangementKind === input.arrangementKind,
  );
  if (!typeConfig) {
    throw new HrFwaCommandError("arrangement_type_not_configured");
  }
  if (!typeConfig.active) {
    throw new HrFwaCommandError("arrangement_type_inactive");
  }

  if (
    typeConfig.requiresSupportingDocument &&
    !input.supportingDocumentId?.trim()
  ) {
    throw new HrFwaCommandError("supporting_document_required");
  }

  if (typeConfig.requiresRemoteLocation && !input.remoteLocationId?.trim()) {
    throw new HrFwaCommandError("remote_location_required");
  }

  if (input.remoteLocationId) {
    await assertHrFwaRemoteLocationApproved({
      organizationId: input.organizationId,
      remoteLocationId: input.remoteLocationId,
      employeeId: input.employeeId,
    });
  }

  const eligibility = await evaluateHrFwaEmployeeEligibility({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    arrangementKind: input.arrangementKind,
    policyGroupCode,
  });

  if (!eligibility.eligible && !input.exceptionRequested) {
    throw new HrFwaCommandError("not_eligible", eligibility.reason);
  }

  return eligibility;
}

const FWA_DEFAULT_REVIEW_INTERVAL_DAYS = 90;
const FWA_DEFAULT_RENEWAL_LEAD_DAYS = 30;

/** HRM-FWA-028 — derive review and renewal reminder dates from effective range. */
export function computeHrFwaLifecycleDates(input: {
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  reviewIntervalDays?: number;
  renewalLeadDays?: number;
}): { reviewDate: Date; renewalDate: Date | null } {
  const reviewIntervalDays =
    input.reviewIntervalDays ?? FWA_DEFAULT_REVIEW_INTERVAL_DAYS;
  const renewalLeadDays = input.renewalLeadDays ?? FWA_DEFAULT_RENEWAL_LEAD_DAYS;

  const reviewDate = new Date(input.effectiveFrom);
  reviewDate.setUTCDate(reviewDate.getUTCDate() + reviewIntervalDays);

  if (!input.effectiveTo) {
    return { reviewDate, renewalDate: null };
  }

  const renewalDate = new Date(input.effectiveTo);
  renewalDate.setUTCDate(renewalDate.getUTCDate() - renewalLeadDays);

  if (renewalDate.getTime() <= input.effectiveFrom.getTime()) {
    return { reviewDate, renewalDate: null };
  }

  return { reviewDate, renewalDate };
}

export async function applyHrFwaArrangementLifecycleDates(input: {
  organizationId: string;
  arrangementId: string;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
}): Promise<void> {
  const { reviewDate, renewalDate } = computeHrFwaLifecycleDates({
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo,
  });

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrFwaArrangements)
      .set({ reviewDate, renewalDate })
      .where(
        and(
          eq(hrFwaArrangements.organizationId, input.organizationId),
          eq(hrFwaArrangements.id, input.arrangementId),
        ),
      );
  });
}

export async function recordHrFwaManagerPeriodicReview(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  reviewNote?: string | null;
  nextReviewIntervalDays?: number;
}): Promise<{ arrangementId: string; nextReviewDate: Date }> {
  const arrangement = await getHrFwaArrangementById({
    organizationId: input.organizationId,
    arrangementId: input.arrangementId,
  });

  const intervalDays =
    input.nextReviewIntervalDays ?? FWA_DEFAULT_REVIEW_INTERVAL_DAYS;
  const nextReviewDate = new Date();
  nextReviewDate.setUTCDate(nextReviewDate.getUTCDate() + intervalDays);

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrFwaArrangements)
      .set({ reviewDate: nextReviewDate })
      .where(eq(hrFwaArrangements.id, input.arrangementId));
  });

  await appendHrFwaAuditEvent({
    organizationId: input.organizationId,
    action: "schedule_updated",
    summary: input.reviewNote?.trim() || "Periodic manager review recorded",
    arrangementId: input.arrangementId,
    employeeId: arrangement.employeeId,
    actorAuthUserId: input.actorAuthUserId,
    metadata: { nextReviewDate: nextReviewDate.toISOString() },
  });

  return { arrangementId: input.arrangementId, nextReviewDate };
}

export async function listHrFwaArrangementsDueForLifecycleAction(input: {
  organizationId: string;
  asOf?: Date;
  limit?: number;
}): Promise<
  readonly {
    arrangementId: string;
    employeeId: string;
    kind: "review_due" | "renewal_due" | "expired";
    dueDate: Date;
  }[]
> {
  const asOf = input.asOf ?? new Date();
  const limit = clampPageSize(input.limit ?? 50);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrFwaArrangements.id,
        employeeId: hrFwaArrangements.employeeId,
        reviewDate: hrFwaArrangements.reviewDate,
        renewalDate: hrFwaArrangements.renewalDate,
        effectiveTo: hrFwaArrangements.effectiveTo,
        status: hrFwaArrangements.status,
      })
      .from(hrFwaArrangements)
      .where(
        and(
          eq(hrFwaArrangements.organizationId, input.organizationId),
          eq(hrFwaArrangements.status, "active"),
        ),
      )
      .limit(limit * 3);

    const due: {
      arrangementId: string;
      employeeId: string;
      kind: "review_due" | "renewal_due" | "expired";
      dueDate: Date;
    }[] = [];

    for (const row of rows) {
      if (
        row.effectiveTo &&
        row.effectiveTo.getTime() < asOf.getTime()
      ) {
        due.push({
          arrangementId: row.id,
          employeeId: row.employeeId,
          kind: "expired",
          dueDate: row.effectiveTo,
        });
        continue;
      }
      if (row.reviewDate && row.reviewDate.getTime() <= asOf.getTime()) {
        due.push({
          arrangementId: row.id,
          employeeId: row.employeeId,
          kind: "review_due",
          dueDate: row.reviewDate,
        });
      }
      if (row.renewalDate && row.renewalDate.getTime() <= asOf.getTime()) {
        due.push({
          arrangementId: row.id,
          employeeId: row.employeeId,
          kind: "renewal_due",
          dueDate: row.renewalDate,
        });
      }
    }

    return due.slice(0, limit);
  });
}

export type HrFwaRequestRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  arrangementKind: HrFwaArrangementKind;
  status: string;
  initiatorKind: string;
  reason: string | null;
  startDate: Date;
  endDate: Date | null;
  submittedAt: Date;
  decidedAt: Date | null;
};

export type HrFwaRequestWindow = {
  rows: readonly HrFwaRequestRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrFwaRequestsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  employeeId?: string;
  arrangementKind?: HrFwaArrangementKind;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrFwaRequestWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrFwaRequests.organizationId, input.organizationId),
    ];

    if (input.status) {
      conditions.push(eq(hrFwaRequests.status, input.status as never));
    }
    if (input.employeeId) {
      conditions.push(eq(hrFwaRequests.employeeId, input.employeeId));
    }
    if (input.arrangementKind) {
      conditions.push(eq(hrFwaRequests.arrangementKind, input.arrangementKind));
    }
    if (input.visibleEmployeeIds) {
      if (input.visibleEmployeeIds.length === 0) {
        return {
          rows: [],
          pageSize,
          totalCount: 0,
          hasNextPage: false,
        };
      }
      conditions.push(
        sql`${hrFwaRequests.employeeId} IN (${sql.join(
          input.visibleEmployeeIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrFwaRequests.reason, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrFwaRequests)
      .innerJoin(hrEmployees, eq(hrFwaRequests.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrFwaRequests.id,
        employeeId: hrFwaRequests.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        arrangementKind: hrFwaRequests.arrangementKind,
        status: hrFwaRequests.status,
        initiatorKind: hrFwaRequests.initiatorKind,
        reason: hrFwaRequests.reason,
        startDate: hrFwaRequests.startDate,
        endDate: hrFwaRequests.endDate,
        submittedAt: hrFwaRequests.submittedAt,
        decidedAt: hrFwaRequests.decidedAt,
      })
      .from(hrFwaRequests)
      .innerJoin(hrEmployees, eq(hrFwaRequests.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrFwaRequests.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        arrangementKind: row.arrangementKind,
        status: row.status,
        initiatorKind: row.initiatorKind,
        reason: row.reason,
        startDate: row.startDate,
        endDate: row.endDate,
        submittedAt: row.submittedAt,
        decidedAt: row.decidedAt,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export type HrFwaAuditTrailRow = {
  id: string;
  occurredAt: Date;
  action: string;
  summary: string;
  employeeId: string | null;
  arrangementId: string | null;
  requestId: string | null;
  actorAuthUserId: string | null;
};

export type HrFwaAuditTrailWindow = {
  rows: readonly HrFwaAuditTrailRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrFwaAuditEventsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  arrangementId?: string;
  requestId?: string;
  employeeId?: string;
}): Promise<HrFwaAuditTrailWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrFwaAuditEvents.organizationId, input.organizationId),
    ];

    if (input.arrangementId) {
      conditions.push(eq(hrFwaAuditEvents.arrangementId, input.arrangementId));
    }
    if (input.requestId) {
      conditions.push(eq(hrFwaAuditEvents.requestId, input.requestId));
    }
    if (input.employeeId) {
      conditions.push(eq(hrFwaAuditEvents.employeeId, input.employeeId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrFwaAuditEvents.summary, pattern),
          ilike(hrFwaAuditEvents.action, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrFwaAuditEvents)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrFwaAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrFwaAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        occurredAt: row.occurredAt,
        action: row.action,
        summary: row.summary,
        employeeId: row.employeeId,
        arrangementId: row.arrangementId,
        requestId: row.requestId,
        actorAuthUserId: row.actorAuthUserId,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function enqueueHrFwaNotification(input: {
  organizationId: string;
  recipientAuthUserId: string;
  kind: (typeof hrFwaNotifications.$inferInsert)["kind"];
  subjectType: string;
  subjectId: string;
  title: string;
  body: string;
}): Promise<{ notificationId: string }> {
  const notificationId = createEntityId("hr_fwa_ntf");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrFwaNotifications).values({
      id: notificationId,
      organizationId: input.organizationId,
      recipientAuthUserId: input.recipientAuthUserId,
      kind: input.kind,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      title: input.title.trim(),
      body: input.body.trim(),
    });
  });
  return { notificationId };
}

export type HrFwaReportGroupBy =
  | "employee"
  | "department"
  | "manager"
  | "legal_entity"
  | "location"
  | "arrangement_kind"
  | "status"
  | "period";

export type HrFwaReportRow = {
  groupKey: string;
  groupLabel: string;
  activeCount: number;
  pendingRequestCount: number;
  complianceBreachCount: number;
};

export async function summarizeHrFwaReport(input: {
  organizationId: string;
  groupBy: HrFwaReportGroupBy;
  periodStart?: Date;
  periodEnd?: Date;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<readonly HrFwaReportRow[]> {
  const periodStart = input.periodStart;
  const periodEnd = input.periodEnd;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const arrangementConditions = [
      eq(hrFwaArrangements.organizationId, input.organizationId),
    ];
    if (periodStart) {
      arrangementConditions.push(
        gte(hrFwaArrangements.effectiveFrom, periodStart),
      );
    }
    if (periodEnd) {
      arrangementConditions.push(
        or(
          isNull(hrFwaArrangements.effectiveTo),
          lte(hrFwaArrangements.effectiveTo, periodEnd),
        )!,
      );
    }
    if (input.visibleEmployeeIds) {
      if (input.visibleEmployeeIds.length === 0) {
        return [];
      }
      arrangementConditions.push(
        sql`${hrFwaArrangements.employeeId} IN (${sql.join(
          input.visibleEmployeeIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );
    }

    const arrangements = await db
      .select({
        id: hrFwaArrangements.id,
        employeeId: hrFwaArrangements.employeeId,
        status: hrFwaArrangements.status,
        arrangementKind: hrFwaArrangements.arrangementKind,
        effectiveFrom: hrFwaArrangements.effectiveFrom,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrEmployees.currentDepartmentId,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
        departmentName: hrDepartments.name,
      })
      .from(hrFwaArrangements)
      .innerJoin(hrEmployees, eq(hrFwaArrangements.employeeId, hrEmployees.id))
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .where(and(...arrangementConditions));

    const managerIds = [
      ...new Set(
        arrangements
          .map((row) => row.managerEmployeeId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const managerLabels = new Map<string, string>();
    if (managerIds.length > 0) {
      const managers = await db
        .select({
          id: hrEmployees.id,
          legalName: hrEmployees.legalName,
          preferredName: hrEmployees.preferredName,
        })
        .from(hrEmployees)
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            sql`${hrEmployees.id} IN (${sql.join(
              managerIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          ),
        );
      for (const manager of managers) {
        managerLabels.set(
          manager.id,
          manager.preferredName?.trim() || manager.legalName,
        );
      }
    }

    const buckets = new Map<
      string,
      {
        label: string;
        active: number;
      }
    >();

    for (const row of arrangements) {
      let groupKey: string;
      let groupLabel: string;

      switch (input.groupBy) {
        case "employee":
          groupKey = row.employeeId;
          groupLabel = `${row.preferredName?.trim() || row.legalName} (${row.employeeNumber})`;
          break;
        case "department":
          groupKey = row.departmentId ?? "unassigned";
          groupLabel = row.departmentName ?? "Unassigned";
          break;
        case "manager":
          groupKey = row.managerEmployeeId ?? "unassigned";
          groupLabel =
            (row.managerEmployeeId &&
              managerLabels.get(row.managerEmployeeId)) ||
            "Unassigned";
          break;
        case "legal_entity":
          groupKey = row.legalEntityCode ?? "unassigned";
          groupLabel = row.legalEntityCode ?? "Unassigned";
          break;
        case "location":
          groupKey = row.workLocationCode ?? "unassigned";
          groupLabel = row.workLocationCode ?? "Unassigned";
          break;
        case "arrangement_kind":
          groupKey = row.arrangementKind;
          groupLabel = row.arrangementKind.replace(/_/g, " ");
          break;
        case "status":
          groupKey = row.status;
          groupLabel = row.status.replace(/_/g, " ");
          break;
        case "period": {
          const month = row.effectiveFrom.toISOString().slice(0, 7);
          groupKey = month;
          groupLabel = month;
          break;
        }
        default:
          groupKey = "all";
          groupLabel = "All";
      }

      const bucket = buckets.get(groupKey) ?? { label: groupLabel, active: 0 };
      if (row.status === "active") {
        bucket.active += 1;
      }
      buckets.set(groupKey, bucket);
    }

    return [...buckets.entries()]
      .map(([groupKey, bucket]) => ({
        groupKey,
        groupLabel: bucket.label,
        activeCount: bucket.active,
        pendingRequestCount: 0,
        complianceBreachCount: 0,
      }))
      .sort((a, b) => a.groupLabel.localeCompare(b.groupLabel));
  });
}
