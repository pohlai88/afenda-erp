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
} from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  hrAttendanceDays,
  hrAttendanceDayStatusEnum,
  hrEmployees,
  hrLeaveBalanceLedger,
  hrLeaveBalances,
  hrLeaveEntitlementRules,
  hrLeaveRequests,
  hrLeaveTypeConfigs,
} from "./schema/hr";

import type { HrLeaveType } from "./hr-leave-validation";

export type HrAttendanceDayStatus =
  (typeof hrAttendanceDayStatusEnum.enumValues)[number];

export type HrAttendanceDayRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  workDate: Date;
  workCalendarCode: string;
  status: HrAttendanceDayStatus;
  dayState: "open" | "computed" | "locked";
  notes: string | null;
};

export type HrAttendanceDayWindow = {
  rows: readonly HrAttendanceDayRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrLeaveBalanceRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  leaveType: HrLeaveType;
  entitlementYear: number;
  openingDays: string;
  earnedDays: string;
  usedDays: string;
  pendingDays: string;
  adjustedDays: string;
  forfeitedDays: string;
  carriedForwardDays: string;
  remainingDays: string;
};

export type HrLeaveBalanceWindow = {
  rows: readonly HrLeaveBalanceRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrLeaveTypeConfigRow = {
  id: string;
  policyGroupCode: string;
  leaveType: HrLeaveType;
  label: string;
  requiresSupportingDocument: boolean;
  requiresMedicalCertificate: boolean;
  active: boolean;
};

export type HrLeaveEntitlementRuleRow = {
  id: string;
  policyGroupCode: string;
  leaveType: HrLeaveType;
  legalEntityCode: string | null;
  countryCode: string | null;
  workLocationCode: string | null;
  employmentType: string | null;
  grade: string | null;
  minTenureMonths: number | null;
  maxTenureMonths: number | null;
  annualEntitlementDays: string;
  requiresConfirmation: boolean;
};

export class HrLamCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "attendance_day_not_found"
    | "invalid_date_range"
    | "leave_type_not_configured"
    | "leave_type_inactive"
    | "supporting_document_required"
    | "insufficient_leave_balance"
    | "leave_not_eligible"
    | "employee_not_confirmed"
    | "request_not_found"
    | "request_not_pending"
    | "request_not_actionable"
    | "entitlement_rule_not_found"
    | "leave_application_policy_violation"
    | "leave_policy_not_found"
    | "rejection_reason_required"
    | "unauthorized_approver"
    | "cancellation_not_allowed"
    | "amendment_not_allowed"
    | "adjustment_reason_required"
    | "medical_certificate_required"
    | "attendance_corrections_disabled"
    | "attendance_day_locked"
    | "correction_request_not_found"
    | "correction_request_not_pending";

  constructor(code: HrLamCommandError["code"], message?: string) {
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

function computeDurationDays(startAt: Date, endAt: Date): string {
  if (endAt.getTime() < startAt.getTime()) {
    throw new HrLamCommandError("invalid_date_range");
  }
  const msPerDay = 86_400_000;
  const days = (endAt.getTime() - startAt.getTime()) / msPerDay + 1;
  return days.toFixed(2);
}

export function computeRemainingDays(balance: {
  openingDays: string;
  earnedDays: string;
  usedDays: string;
  pendingDays: string;
  adjustedDays: string;
  forfeitedDays: string;
  carriedForwardDays: string;
}): string {
  const total =
    Number(balance.openingDays) +
    Number(balance.earnedDays) +
    Number(balance.adjustedDays) +
    Number(balance.carriedForwardDays) -
    Number(balance.usedDays) -
    Number(balance.pendingDays) -
    Number(balance.forfeitedDays);
  return total.toFixed(2);
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function computeTenureMonths(employmentStartDate: Date | null, asOf: Date): number {
  if (!employmentStartDate) return 0;
  const start = employmentStartDate.getTime();
  const end = asOf.getTime();
  if (end <= start) return 0;
  const months =
    (asOf.getUTCFullYear() - employmentStartDate.getUTCFullYear()) * 12 +
    (asOf.getUTCMonth() - employmentStartDate.getUTCMonth());
  return Math.max(0, months);
}

function ruleSpecificityScore(rule: HrLeaveEntitlementRuleRow): number {
  let score = 0;
  if (rule.legalEntityCode) score += 32;
  if (rule.countryCode) score += 16;
  if (rule.workLocationCode) score += 8;
  if (rule.employmentType) score += 4;
  if (rule.grade) score += 2;
  if (rule.minTenureMonths !== null || rule.maxTenureMonths !== null) score += 1;
  return score;
}

function matchesEntitlementRule(
  rule: HrLeaveEntitlementRuleRow,
  employee: {
    legalEntityCode: string | null;
    countryCode: string | null;
    workLocationCode: string | null;
    employmentType: string | null;
    grade: string | null;
    tenureMonths: number;
  },
): boolean {
  if (rule.legalEntityCode && rule.legalEntityCode !== employee.legalEntityCode) {
    return false;
  }
  if (rule.countryCode && rule.countryCode !== employee.countryCode) {
    return false;
  }
  if (rule.workLocationCode && rule.workLocationCode !== employee.workLocationCode) {
    return false;
  }
  if (rule.employmentType && rule.employmentType !== employee.employmentType) {
    return false;
  }
  if (rule.grade && rule.grade !== employee.grade) {
    return false;
  }
  if (
    rule.minTenureMonths !== null &&
    employee.tenureMonths < rule.minTenureMonths
  ) {
    return false;
  }
  if (
    rule.maxTenureMonths !== null &&
    employee.tenureMonths > rule.maxTenureMonths
  ) {
    return false;
  }
  return true;
}

async function loadEmployeeContext(
  organizationId: string,
  employeeId: string,
): Promise<{
  id: string;
  legalEntityCode: string | null;
  countryCode: string | null;
  workLocationCode: string | null;
  employmentType: string | null;
  grade: string | null;
  employmentStartDate: Date | null;
  confirmationDate: Date | null;
  employmentStatus: string;
}> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [employee] = await db
      .select({
        id: hrEmployees.id,
        legalEntityCode: hrEmployees.legalEntityCode,
        countryCode: hrEmployees.countryCode,
        workLocationCode: hrEmployees.workLocationCode,
        employmentType: hrEmployees.employmentType,
        grade: hrEmployees.grade,
        employmentStartDate: hrEmployees.employmentStartDate,
        confirmationDate: hrEmployees.confirmationDate,
        employmentStatus: hrEmployees.employmentStatus,
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
      throw new HrLamCommandError("employee_not_found");
    }

    return employee;
  });
}

export async function listHrAttendanceDaysWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  status?: HrAttendanceDayStatus;
  workDateFrom?: Date;
  workDateTo?: Date;
}): Promise<HrAttendanceDayWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrAttendanceDays.organizationId, input.organizationId),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrAttendanceDays.employeeId, input.employeeId));
    }
    if (input.status) {
      conditions.push(eq(hrAttendanceDays.status, input.status));
    }
    if (input.workDateFrom) {
      conditions.push(gte(hrAttendanceDays.workDate, input.workDateFrom));
    }
    if (input.workDateTo) {
      conditions.push(lte(hrAttendanceDays.workDate, input.workDateTo));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrAttendanceDays.notes, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrAttendanceDays)
      .innerJoin(hrEmployees, eq(hrAttendanceDays.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrAttendanceDays.id,
        employeeId: hrAttendanceDays.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        workDate: hrAttendanceDays.workDate,
        workCalendarCode: hrAttendanceDays.workCalendarCode,
        status: hrAttendanceDays.status,
        dayState: hrAttendanceDays.dayState,
        notes: hrAttendanceDays.notes,
      })
      .from(hrAttendanceDays)
      .innerJoin(hrEmployees, eq(hrAttendanceDays.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrAttendanceDays.workDate))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        workDate: row.workDate,
        workCalendarCode: row.workCalendarCode,
        status: row.status,
        dayState: row.dayState,
        notes: row.notes,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function upsertHrAttendanceDay(input: {
  organizationId: string;
  employeeId: string;
  workDate: Date;
  workCalendarCode?: string;
  status: HrAttendanceDayStatus;
  notes?: string | null;
}): Promise<{ attendanceDayId: string; created: boolean }> {
  await loadEmployeeContext(input.organizationId, input.employeeId);
  const normalizedWorkDate = startOfUtcDay(input.workDate);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrAttendanceDays.id })
      .from(hrAttendanceDays)
      .where(
        and(
          eq(hrAttendanceDays.organizationId, input.organizationId),
          eq(hrAttendanceDays.employeeId, input.employeeId),
          eq(hrAttendanceDays.workDate, normalizedWorkDate),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrAttendanceDays)
        .set({
          status: input.status,
          workCalendarCode: input.workCalendarCode ?? "default",
          notes: input.notes?.trim() || null,
          dayState: "computed",
        })
        .where(eq(hrAttendanceDays.id, existing.id));
      return { attendanceDayId: existing.id, created: false };
    }

    const attendanceDayId = createEntityId("hr_att_day");
    await db.insert(hrAttendanceDays).values({
      id: attendanceDayId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      workDate: normalizedWorkDate,
      workCalendarCode: input.workCalendarCode ?? "default",
      status: input.status,
      dayState: "computed",
      notes: input.notes?.trim() || null,
    });

    return { attendanceDayId, created: true };
  });
}

export async function listHrLeaveTypeConfigs(input: {
  organizationId: string;
  policyGroupCode?: string;
  activeOnly?: boolean;
}): Promise<readonly HrLeaveTypeConfigRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrLeaveTypeConfigs.organizationId, input.organizationId),
    ];
    if (input.policyGroupCode) {
      conditions.push(
        eq(hrLeaveTypeConfigs.policyGroupCode, input.policyGroupCode),
      );
    }
    if (input.activeOnly !== false) {
      conditions.push(eq(hrLeaveTypeConfigs.active, true));
    }

    const rows = await db
      .select()
      .from(hrLeaveTypeConfigs)
      .where(and(...conditions))
      .orderBy(hrLeaveTypeConfigs.policyGroupCode, hrLeaveTypeConfigs.leaveType);

    return rows.map((row) => ({
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      leaveType: row.leaveType,
      label: row.label,
      requiresSupportingDocument: row.requiresSupportingDocument,
      requiresMedicalCertificate: row.requiresMedicalCertificate,
      active: row.active,
    }));
  });
}

export async function upsertHrLeaveTypeConfig(input: {
  organizationId: string;
  policyGroupCode?: string;
  leaveType: HrLeaveType;
  label: string;
  requiresSupportingDocument?: boolean;
  requiresMedicalCertificate?: boolean;
  active?: boolean;
}): Promise<{ configId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrLeaveTypeConfigs.id })
      .from(hrLeaveTypeConfigs)
      .where(
        and(
          eq(hrLeaveTypeConfigs.organizationId, input.organizationId),
          eq(hrLeaveTypeConfigs.policyGroupCode, policyGroupCode),
          eq(hrLeaveTypeConfigs.leaveType, input.leaveType),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrLeaveTypeConfigs)
        .set({
          label: input.label.trim(),
          requiresSupportingDocument: input.requiresSupportingDocument ?? false,
          requiresMedicalCertificate: input.requiresMedicalCertificate ?? false,
          active: input.active ?? true,
        })
        .where(eq(hrLeaveTypeConfigs.id, existing.id));
      return { configId: existing.id };
    }

    const configId = createEntityId("hr_lv_type");
    await db.insert(hrLeaveTypeConfigs).values({
      id: configId,
      organizationId: input.organizationId,
      policyGroupCode,
      leaveType: input.leaveType,
      label: input.label.trim(),
      requiresSupportingDocument: input.requiresSupportingDocument ?? false,
      requiresMedicalCertificate: input.requiresMedicalCertificate ?? false,
      active: input.active ?? true,
    });
    return { configId };
  });
}

export async function listHrLeaveEntitlementRules(input: {
  organizationId: string;
  policyGroupCode?: string;
  leaveType?: HrLeaveType;
}): Promise<readonly HrLeaveEntitlementRuleRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrLeaveEntitlementRules.organizationId, input.organizationId),
    ];
    if (input.policyGroupCode) {
      conditions.push(
        eq(hrLeaveEntitlementRules.policyGroupCode, input.policyGroupCode),
      );
    }
    if (input.leaveType) {
      conditions.push(eq(hrLeaveEntitlementRules.leaveType, input.leaveType));
    }

    const rows = await db
      .select()
      .from(hrLeaveEntitlementRules)
      .where(and(...conditions))
      .orderBy(desc(hrLeaveEntitlementRules.effectiveFrom));

    return rows.map((row) => ({
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      leaveType: row.leaveType,
      legalEntityCode: row.legalEntityCode,
      countryCode: row.countryCode,
      workLocationCode: row.workLocationCode,
      employmentType: row.employmentType,
      grade: row.grade,
      minTenureMonths: row.minTenureMonths,
      maxTenureMonths: row.maxTenureMonths,
      annualEntitlementDays: row.annualEntitlementDays,
      requiresConfirmation: row.requiresConfirmation,
    }));
  });
}

export async function upsertHrLeaveEntitlementRule(input: {
  organizationId: string;
  policyGroupCode?: string;
  leaveType: HrLeaveType;
  legalEntityCode?: string | null;
  countryCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  grade?: string | null;
  minTenureMonths?: number | null;
  maxTenureMonths?: number | null;
  annualEntitlementDays: string;
  requiresConfirmation?: boolean;
}): Promise<{ ruleId: string }> {
  const ruleId = createEntityId("hr_lv_ent");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrLeaveEntitlementRules).values({
      id: ruleId,
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode ?? "default",
      leaveType: input.leaveType,
      legalEntityCode: input.legalEntityCode ?? null,
      countryCode: input.countryCode ?? null,
      workLocationCode: input.workLocationCode ?? null,
      employmentType: input.employmentType ?? null,
      grade: input.grade ?? null,
      minTenureMonths: input.minTenureMonths ?? null,
      maxTenureMonths: input.maxTenureMonths ?? null,
      annualEntitlementDays: input.annualEntitlementDays,
      requiresConfirmation: input.requiresConfirmation ?? false,
    });
  });
  return { ruleId };
}

export async function calculateHrLeaveEntitlementForEmployee(input: {
  organizationId: string;
  employeeId: string;
  leaveType: HrLeaveType;
  policyGroupCode?: string;
  asOf?: Date;
}): Promise<{ annualEntitlementDays: string; ruleId: string | null }> {
  const employee = await loadEmployeeContext(
    input.organizationId,
    input.employeeId,
  );
  const asOf = input.asOf ?? new Date();
  const policyGroupCode = input.policyGroupCode ?? "default";
  const tenureMonths = computeTenureMonths(employee.employmentStartDate, asOf);

  const rules = await listHrLeaveEntitlementRules({
    organizationId: input.organizationId,
    policyGroupCode,
    leaveType: input.leaveType,
  });

  const employeeContext = {
    legalEntityCode: employee.legalEntityCode,
    countryCode: employee.countryCode,
    workLocationCode: employee.workLocationCode,
    employmentType: employee.employmentType,
    grade: employee.grade,
    tenureMonths,
  };

  const matching = rules
    .filter((rule) => matchesEntitlementRule(rule, employeeContext))
    .sort((a, b) => ruleSpecificityScore(b) - ruleSpecificityScore(a));

  const best = matching[0];
  if (!best) {
    return { annualEntitlementDays: "0.00", ruleId: null };
  }

  return {
    annualEntitlementDays: best.annualEntitlementDays,
    ruleId: best.id,
  };
}

export async function ensureHrLeaveBalance(input: {
  organizationId: string;
  employeeId: string;
  leaveType: HrLeaveType;
  entitlementYear: number;
  policyGroupCode?: string;
}): Promise<{ balanceId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrLeaveBalances.id })
      .from(hrLeaveBalances)
      .where(
        and(
          eq(hrLeaveBalances.organizationId, input.organizationId),
          eq(hrLeaveBalances.employeeId, input.employeeId),
          eq(hrLeaveBalances.leaveType, input.leaveType),
          eq(hrLeaveBalances.entitlementYear, input.entitlementYear),
        ),
      )
      .limit(1);

    if (existing) {
      return { balanceId: existing.id };
    }

    const entitlement = await calculateHrLeaveEntitlementForEmployee({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      leaveType: input.leaveType,
      policyGroupCode: input.policyGroupCode,
    });

    const balanceId = createEntityId("hr_lv_bal");
    await db.insert(hrLeaveBalances).values({
      id: balanceId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      leaveType: input.leaveType,
      entitlementYear: input.entitlementYear,
      earnedDays: entitlement.annualEntitlementDays,
    });

    return { balanceId };
  });
}

export async function listHrLeaveBalancesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  leaveType?: HrLeaveType;
  entitlementYear?: number;
}): Promise<HrLeaveBalanceWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrLeaveBalances.organizationId, input.organizationId),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrLeaveBalances.employeeId, input.employeeId));
    }
    if (input.leaveType) {
      conditions.push(eq(hrLeaveBalances.leaveType, input.leaveType));
    }
    if (input.entitlementYear !== undefined) {
      conditions.push(
        eq(hrLeaveBalances.entitlementYear, input.entitlementYear),
      );
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
      .from(hrLeaveBalances)
      .innerJoin(hrEmployees, eq(hrLeaveBalances.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrLeaveBalances.id,
        employeeId: hrLeaveBalances.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        leaveType: hrLeaveBalances.leaveType,
        entitlementYear: hrLeaveBalances.entitlementYear,
        openingDays: hrLeaveBalances.openingDays,
        earnedDays: hrLeaveBalances.earnedDays,
        usedDays: hrLeaveBalances.usedDays,
        pendingDays: hrLeaveBalances.pendingDays,
        adjustedDays: hrLeaveBalances.adjustedDays,
        forfeitedDays: hrLeaveBalances.forfeitedDays,
        carriedForwardDays: hrLeaveBalances.carriedForwardDays,
      })
      .from(hrLeaveBalances)
      .innerJoin(hrEmployees, eq(hrLeaveBalances.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrLeaveBalances.entitlementYear))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        leaveType: row.leaveType,
        entitlementYear: row.entitlementYear,
        openingDays: row.openingDays,
        earnedDays: row.earnedDays,
        usedDays: row.usedDays,
        pendingDays: row.pendingDays,
        adjustedDays: row.adjustedDays,
        forfeitedDays: row.forfeitedDays,
        carriedForwardDays: row.carriedForwardDays,
        remainingDays: computeRemainingDays(row),
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

async function validateLeaveEligibility(input: {
  organizationId: string;
  employeeId: string;
  leaveType: HrLeaveType;
  policyGroupCode: string;
}): Promise<void> {
  const [employee, typeConfigs, entitlement] = await Promise.all([
    loadEmployeeContext(input.organizationId, input.employeeId),
    listHrLeaveTypeConfigs({
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode,
      activeOnly: true,
    }),
    calculateHrLeaveEntitlementForEmployee({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      leaveType: input.leaveType,
      policyGroupCode: input.policyGroupCode,
    }),
  ]);

  const typeConfig = typeConfigs.find(
    (config) => config.leaveType === input.leaveType,
  );
  if (!typeConfig) {
    throw new HrLamCommandError("leave_type_not_configured");
  }
  if (!typeConfig.active) {
    throw new HrLamCommandError("leave_type_inactive");
  }

  if (Number(entitlement.annualEntitlementDays) <= 0 && input.leaveType !== "unpaid") {
    const rules = await listHrLeaveEntitlementRules({
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode,
      leaveType: input.leaveType,
    });
    const tenureMonths = computeTenureMonths(
      employee.employmentStartDate,
      new Date(),
    );
    const matched = rules.find((rule) =>
      matchesEntitlementRule(rule, {
        legalEntityCode: employee.legalEntityCode,
        countryCode: employee.countryCode,
        workLocationCode: employee.workLocationCode,
        employmentType: employee.employmentType,
        grade: employee.grade,
        tenureMonths,
      }),
    );
    if (matched?.requiresConfirmation && !employee.confirmationDate) {
      throw new HrLamCommandError("employee_not_confirmed");
    }
    if (!matched) {
      throw new HrLamCommandError("leave_not_eligible");
    }
  }
}

async function validateLeaveBalance(input: {
  organizationId: string;
  employeeId: string;
  leaveType: HrLeaveType;
  entitlementYear: number;
  durationDays: string;
  policyGroupCode: string;
}): Promise<void> {
  if (input.leaveType === "unpaid") {
    return;
  }

  await ensureHrLeaveBalance({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    entitlementYear: input.entitlementYear,
    policyGroupCode: input.policyGroupCode,
  });

  const window = await listHrLeaveBalancesWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    entitlementYear: input.entitlementYear,
    limit: 1,
  });

  const balance = window.rows[0];
  if (!balance) {
    throw new HrLamCommandError("insufficient_leave_balance");
  }

  if (Number(balance.remainingDays) < Number(input.durationDays)) {
    throw new HrLamCommandError("insufficient_leave_balance");
  }
}

export async function submitHrLeaveApplication(input: {
  organizationId: string;
  employeeId: string;
  leaveType: HrLeaveType;
  startAt: Date;
  endAt: Date;
  reason?: string | null;
  supportingDocumentId?: string | null;
  medicalCertificateReference?: string | null;
  panelClinicReference?: string | null;
  hospitalizationReference?: string | null;
  policyGroupCode?: string;
}): Promise<{ requestId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  const durationDays = computeDurationDays(input.startAt, input.endAt);
  const entitlementYear = input.startAt.getUTCFullYear();

  const typeConfigs = await listHrLeaveTypeConfigs({
    organizationId: input.organizationId,
    policyGroupCode,
    activeOnly: true,
  });
  const typeConfig = typeConfigs.find(
    (config) => config.leaveType === input.leaveType,
  );
  if (!typeConfig) {
    throw new HrLamCommandError("leave_type_not_configured");
  }
  if (
    typeConfig.requiresSupportingDocument &&
    !input.supportingDocumentId?.trim()
  ) {
    throw new HrLamCommandError("supporting_document_required");
  }

  if (
    typeConfig.requiresMedicalCertificate &&
    !input.medicalCertificateReference?.trim()
  ) {
    throw new HrLamCommandError("medical_certificate_required");
  }

  await validateLeaveEligibility({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    policyGroupCode,
  });

  await validateLeaveBalance({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    entitlementYear,
    durationDays,
    policyGroupCode,
  });

  const { validateHrLeaveApplicationPolicy, resolveHrLeaveApprovalRouteForEmployee } =
    await import("./hr-lam-workflow");

  await validateHrLeaveApplicationPolicy({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    startAt: input.startAt,
    endAt: input.endAt,
    durationDays,
    policyGroupCode,
  });

  const route = await resolveHrLeaveApprovalRouteForEmployee({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    durationDays,
    policyGroupCode,
  });

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const requestId = createEntityId("hr_lv_req");

    await db.transaction(async (tx) => {
      await tx.insert(hrLeaveRequests).values({
        id: requestId,
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        leaveType: input.leaveType,
        policyGroupCode,
        entitlementYear,
        approvalStage: route.initialStage,
        policySnapshot: { route },
        startAt: input.startAt,
        endAt: input.endAt,
        durationDays,
        reason: input.reason?.trim() || null,
        supportingDocumentId: input.supportingDocumentId?.trim() || null,
        medicalCertificateReference:
          input.medicalCertificateReference?.trim() || null,
        panelClinicReference: input.panelClinicReference?.trim() || null,
        hospitalizationReference:
          input.hospitalizationReference?.trim() || null,
        payrollDeductionReference:
          input.leaveType === "unpaid"
            ? `lam.leave.${requestId}.unpaid`
            : null,
      });

      if (input.leaveType !== "unpaid") {
        const [balance] = await tx
          .select({ id: hrLeaveBalances.id, pendingDays: hrLeaveBalances.pendingDays })
          .from(hrLeaveBalances)
          .where(
            and(
              eq(hrLeaveBalances.organizationId, input.organizationId),
              eq(hrLeaveBalances.employeeId, input.employeeId),
              eq(hrLeaveBalances.leaveType, input.leaveType),
              eq(hrLeaveBalances.entitlementYear, entitlementYear),
            ),
          )
          .limit(1);

        if (!balance) {
          throw new HrLamCommandError("insufficient_leave_balance");
        }

        const nextPending = (
          Number(balance.pendingDays) + Number(durationDays)
        ).toFixed(2);

        await tx
          .update(hrLeaveBalances)
          .set({ pendingDays: nextPending })
          .where(eq(hrLeaveBalances.id, balance.id));

        await tx.insert(hrLeaveBalanceLedger).values({
          id: createEntityId("hr_lv_ledger"),
          organizationId: input.organizationId,
          balanceId: balance.id,
          leaveRequestId: requestId,
          kind: "pending_reserve",
          amountDays: durationDays,
          reason: "Leave application submitted",
        });
      }
    });

    return { requestId };
  });
}

export async function listAttendanceDaysForEmployee(input: {
  organizationId: string;
  employeeId: string;
  workDateFrom?: Date;
  workDateTo?: Date;
}): Promise<readonly HrAttendanceDayRow[]> {
  const window = await listHrAttendanceDaysWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    workDateFrom: input.workDateFrom,
    workDateTo: input.workDateTo,
    limit: MAX_PAGE_SIZE,
  });
  return window.rows;
}

export function isAttendanceDayReadyForPayroll(row: {
  dayState: "open" | "computed" | "locked";
  status: HrAttendanceDayStatus;
  calculationSnapshot?: Record<string, unknown> | null;
}): boolean {
  if (row.dayState !== "computed" && row.dayState !== "locked") {
    return false;
  }
  const snapshot = row.calculationSnapshot ?? {};
  if (snapshot.payrollBlocking === true) {
    return false;
  }
  return true;
}
