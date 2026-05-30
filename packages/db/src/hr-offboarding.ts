import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  assertHrEmploymentStatusTransition,
  type HrEmploymentStatus,
} from "./hr-lifecycle";
import {
  hrDepartments,
  hrEmployees,
  hrLifecycleEvents,
  hrOffboardingApprovalSteps,
  hrOffboardingAssets,
  hrOffboardingAuditEvents,
  hrOffboardingCases,
  hrOffboardingClearanceItems,
  hrOffboardingDocumentLinks,
  hrOffboardingSettlementBlockers,
} from "./schema/hr";
import { alias } from "drizzle-orm/pg-core";

const managerEmployee = alias(hrEmployees, "manager_employee");

export type HrOffboardingExitType =
  (typeof hrOffboardingCases.$inferSelect)["exitType"];

export type HrOffboardingAssigneeRole =
  (typeof hrOffboardingClearanceItems.$inferSelect)["assigneeRole"];

export type HrOffboardingAssetStatus =
  (typeof hrOffboardingAssets.$inferSelect)["status"];

export type HrOffboardingRehireEligibility =
  (typeof hrOffboardingCases.$inferSelect)["rehireEligibility"];

export const DEFAULT_OFFBOARDING_CLEARANCE = [
  {
    code: "handover",
    title: "Work handover completed",
    sortOrder: 10,
    assigneeRole: "employee" as const,
    category: "handover" as const,
  },
  {
    code: "it_access",
    title: "IT system access revoked",
    sortOrder: 20,
    assigneeRole: "it" as const,
    category: "access" as const,
  },
  {
    code: "email_access",
    title: "Email access revoked",
    sortOrder: 25,
    assigneeRole: "it" as const,
    category: "access" as const,
  },
  {
    code: "physical_access",
    title: "Building access revoked",
    sortOrder: 30,
    assigneeRole: "it" as const,
    category: "access" as const,
  },
  {
    code: "equipment",
    title: "Company equipment returned",
    sortOrder: 40,
    assigneeRole: "asset_owner" as const,
    category: "asset" as const,
  },
  {
    code: "leave_clearance",
    title: "Leave balance cleared",
    sortOrder: 50,
    assigneeRole: "hr" as const,
    category: "leave" as const,
  },
  {
    code: "claims_clearance",
    title: "Claims and advances cleared",
    sortOrder: 60,
    assigneeRole: "finance" as const,
    category: "general" as const,
  },
  {
    code: "payroll_final",
    title: "Final payroll briefed",
    sortOrder: 70,
    assigneeRole: "payroll" as const,
    category: "payroll" as const,
  },
  {
    code: "exit_interview",
    title: "Exit interview completed",
    sortOrder: 80,
    assigneeRole: "hr" as const,
    category: "general" as const,
  },
  {
    code: "exit_documents",
    title: "Exit documents linked",
    sortOrder: 90,
    assigneeRole: "hr" as const,
    category: "document" as const,
  },
] as const;

export const DEFAULT_OFFBOARDING_APPROVAL_STEPS = [
  {
    stepCode: "manager_approval",
    title: "Manager approval",
    assigneeRole: "manager" as const,
    sortOrder: 10,
  },
  {
    stepCode: "hr_approval",
    title: "HR approval",
    assigneeRole: "hr" as const,
    sortOrder: 20,
  },
] as const;

export const DEFAULT_OFFBOARDING_ASSETS = [
  { assetCode: "laptop", title: "Laptop" },
  { assetCode: "phone", title: "Mobile phone" },
  { assetCode: "access_card", title: "Access card" },
] as const;

export type HrOffboardingCaseRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  departmentName: string | null;
  managerDisplayName: string | null;
  status: (typeof hrOffboardingCases.$inferSelect)["status"];
  exitType: HrOffboardingExitType;
  priorEmploymentStatus: HrEmploymentStatus;
  reason: string | null;
  effectiveDate: Date | null;
  noticeStartDate: Date | null;
  noticeEndDate: Date | null;
  requiredNoticeDays: number | null;
  lastWorkingDate: Date | null;
  settlementReadyAt: Date | null;
  rehireEligibility: HrOffboardingRehireEligibility;
  vacancyTriggered: boolean;
  exitInterviewScheduledAt: Date | null;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  sensitiveDetails: string | null;
  exitInterviewFeedback: string | null;
};

export type HrOffboardingCaseWindow = {
  rows: readonly HrOffboardingCaseRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrOffboardingClearanceItemRow = {
  id: string;
  caseId: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  code: string;
  title: string;
  assigneeRole: HrOffboardingAssigneeRole;
  category: (typeof hrOffboardingClearanceItems.$inferSelect)["category"];
  status: (typeof hrOffboardingClearanceItems.$inferSelect)["status"];
  dueDate: Date | null;
  evidenceNote: string | null;
  completedAt: Date | null;
  isOverdue: boolean;
};

export type HrOffboardingClearanceWindow = {
  rows: readonly HrOffboardingClearanceItemRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrOffboardingOverviewSnapshot = {
  inProgressCount: number;
  completedCount: number;
  overdueClearanceCount: number;
  pendingApprovalCount: number;
  settlementReadyCount: number;
  blockedSettlementCount: number;
};

export class HrOffboardingCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "employee_archived"
    | "case_not_found"
    | "case_not_in_progress"
    | "active_case_exists"
    | "clearance_incomplete"
    | "clearance_item_not_found"
    | "approval_incomplete"
    | "approval_step_not_found"
    | "asset_not_found"
    | "blocker_not_found"
    | "document_not_found"
    | "invalid_status_transition"
    | "invalid_notice_period"
    | "settlement_not_ready";

  constructor(code: HrOffboardingCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const DEFAULT_NOTICE_DAYS = 30;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

export function validateHrOffboardingNoticePeriod(input: {
  noticeStartDate?: Date | null;
  noticeEndDate?: Date | null;
  requiredNoticeDays?: number | null;
  lastWorkingDate?: Date | null;
}): { valid: boolean; computedDays?: number; message?: string } {
  const { noticeStartDate, noticeEndDate, requiredNoticeDays, lastWorkingDate } =
    input;

  if (noticeStartDate && noticeEndDate && noticeEndDate < noticeStartDate) {
    return {
      valid: false,
      message: "Notice end date must be on or after notice start date.",
    };
  }

  if (noticeStartDate && lastWorkingDate && lastWorkingDate < noticeStartDate) {
    return {
      valid: false,
      message: "Last working date must be on or after notice start date.",
    };
  }

  if (noticeStartDate && noticeEndDate) {
    const msPerDay = 86_400_000;
    const computedDays =
      Math.round((noticeEndDate.getTime() - noticeStartDate.getTime()) / msPerDay) +
      1;
    const required = requiredNoticeDays ?? DEFAULT_NOTICE_DAYS;
    if (computedDays < required) {
      return {
        valid: false,
        computedDays,
        message: `Notice period is ${computedDays} day(s); policy requires ${required}.`,
      };
    }
    return { valid: true, computedDays };
  }

  return { valid: true };
}

function computeDueDate(baseDate: Date, offsetDays: number): Date {
  const due = new Date(baseDate);
  due.setDate(due.getDate() + offsetDays);
  return due;
}

async function assertOffboardingEmployeeWritable(
  db: AfendaTransaction,
  organizationId: string,
  employeeId: string,
) {
  const [employee] = await db
    .select({
      id: hrEmployees.id,
      archivedAt: hrEmployees.archivedAt,
      employmentStatus: hrEmployees.employmentStatus,
    })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, organizationId),
        eq(hrEmployees.id, employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrOffboardingCommandError("employee_not_found");
  }
  if (employee.archivedAt) {
    throw new HrOffboardingCommandError("employee_archived");
  }

  return employee;
}

async function insertOffboardingLifecycleEvent(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    kind: string;
    previousStatus: HrEmploymentStatus | null;
    newStatus: HrEmploymentStatus | null;
    effectiveDate: Date;
    reason?: string | null;
  },
) {
  const eventId = createEntityId("hr_lcy_evt");
  await db.insert(hrLifecycleEvents).values({
    id: eventId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    kind: input.kind,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    effectiveDate: input.effectiveDate,
    reason: input.reason?.trim() || null,
  });
  return eventId;
}

async function insertOffboardingAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    caseId?: string | null;
    employeeId?: string | null;
    action: string;
    actorUserId?: string | null;
    summary: string;
    metadata?: Record<string, unknown>;
  },
) {
  await db.insert(hrOffboardingAuditEvents).values({
    id: createEntityId("hr_off_aud"),
    organizationId: input.organizationId,
    caseId: input.caseId ?? null,
    employeeId: input.employeeId ?? null,
    action: input.action,
    actorUserId: input.actorUserId ?? null,
    summary: input.summary,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    occurredAt: new Date(),
  });
}

function maskSensitiveText(value: string | null, canViewSensitive: boolean) {
  if (!value || canViewSensitive) {
    return value;
  }
  return "[restricted]";
}

function mapOffboardingCaseRow(
  row: {
    id: string;
    employeeId: string;
    employeeNumber: string;
    legalName: string;
    preferredName: string | null;
    departmentName: string | null;
    managerLegalName: string | null;
    managerPreferredName: string | null;
    status: (typeof hrOffboardingCases.$inferSelect)["status"];
    exitType: HrOffboardingExitType;
    priorEmploymentStatus: HrEmploymentStatus;
    reason: string | null;
    effectiveDate: Date | null;
    noticeStartDate: Date | null;
    noticeEndDate: Date | null;
    requiredNoticeDays: number | null;
    lastWorkingDate: Date | null;
    settlementReadyAt: Date | null;
    rehireEligibility: HrOffboardingRehireEligibility;
    vacancyTriggered: boolean;
    exitInterviewScheduledAt: Date | null;
    startedAt: Date;
    completedAt: Date | null;
    cancelledAt: Date | null;
    sensitiveDetails: string | null;
    exitInterviewFeedback: string | null;
  },
  canViewSensitive: boolean,
): HrOffboardingCaseRow {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeNumber: row.employeeNumber,
    employeeDisplayName: row.preferredName?.trim() || row.legalName,
    departmentName: row.departmentName,
    managerDisplayName:
      row.managerPreferredName?.trim() || row.managerLegalName,
    status: row.status,
    exitType: row.exitType,
    priorEmploymentStatus: row.priorEmploymentStatus,
    reason: row.reason,
    effectiveDate: row.effectiveDate,
    noticeStartDate: row.noticeStartDate,
    noticeEndDate: row.noticeEndDate,
    requiredNoticeDays: row.requiredNoticeDays,
    lastWorkingDate: row.lastWorkingDate,
    settlementReadyAt: row.settlementReadyAt,
    rehireEligibility: row.rehireEligibility,
    vacancyTriggered: row.vacancyTriggered,
    exitInterviewScheduledAt: row.exitInterviewScheduledAt,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    sensitiveDetails: maskSensitiveText(row.sensitiveDetails, canViewSensitive),
    exitInterviewFeedback: maskSensitiveText(
      row.exitInterviewFeedback,
      canViewSensitive,
    ),
  };
}

export async function loadHrOffboardingOverviewSnapshot(input: {
  organizationId: string;
}): Promise<HrOffboardingOverviewSnapshot> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const now = new Date();
    const [inProgressRow] = await db
      .select({ total: count() })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.status, "in_progress"),
        ),
      );
    const [completedRow] = await db
      .select({ total: count() })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.status, "completed"),
        ),
      );
    const [overdueRow] = await db
      .select({ total: count() })
      .from(hrOffboardingClearanceItems)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingClearanceItems.caseId, hrOffboardingCases.id),
      )
      .where(
        and(
          eq(hrOffboardingClearanceItems.organizationId, input.organizationId),
          eq(hrOffboardingClearanceItems.status, "pending"),
          eq(hrOffboardingCases.status, "in_progress"),
          lt(hrOffboardingClearanceItems.dueDate, now),
        ),
      );
    const [pendingApprovalRow] = await db
      .select({ total: count() })
      .from(hrOffboardingApprovalSteps)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingApprovalSteps.caseId, hrOffboardingCases.id),
      )
      .where(
        and(
          eq(hrOffboardingApprovalSteps.organizationId, input.organizationId),
          eq(hrOffboardingApprovalSteps.status, "pending"),
          eq(hrOffboardingCases.status, "in_progress"),
        ),
      );
    const [settlementReadyRow] = await db
      .select({ total: count() })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.status, "in_progress"),
          sql`${hrOffboardingCases.settlementReadyAt} IS NOT NULL`,
        ),
      );
    const [blockedRow] = await db
      .select({ total: count() })
      .from(hrOffboardingSettlementBlockers)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingSettlementBlockers.caseId, hrOffboardingCases.id),
      )
      .where(
        and(
          eq(hrOffboardingSettlementBlockers.organizationId, input.organizationId),
          eq(hrOffboardingSettlementBlockers.resolved, false),
          eq(hrOffboardingCases.status, "in_progress"),
        ),
      );

    return {
      inProgressCount: Number(inProgressRow?.total ?? 0),
      completedCount: Number(completedRow?.total ?? 0),
      overdueClearanceCount: Number(overdueRow?.total ?? 0),
      pendingApprovalCount: Number(pendingApprovalRow?.total ?? 0),
      settlementReadyCount: Number(settlementReadyRow?.total ?? 0),
      blockedSettlementCount: Number(blockedRow?.total ?? 0),
    };
  });
}

export async function listHrOffboardingCasesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrOffboardingCases.$inferSelect)["status"];
  exitType?: HrOffboardingExitType;
  canViewSensitive?: boolean;
}): Promise<HrOffboardingCaseWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const canViewSensitive = input.canViewSensitive ?? false;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrOffboardingCases.organizationId, input.organizationId)];

    if (input.status) {
      conditions.push(eq(hrOffboardingCases.status, input.status));
    }
    if (input.exitType) {
      conditions.push(eq(hrOffboardingCases.exitType, input.exitType));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrOffboardingCases.reason, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOffboardingCases)
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOffboardingCases.id,
        employeeId: hrOffboardingCases.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentName: hrDepartments.name,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        status: hrOffboardingCases.status,
        exitType: hrOffboardingCases.exitType,
        priorEmploymentStatus: hrOffboardingCases.priorEmploymentStatus,
        reason: hrOffboardingCases.reason,
        effectiveDate: hrOffboardingCases.effectiveDate,
        noticeStartDate: hrOffboardingCases.noticeStartDate,
        noticeEndDate: hrOffboardingCases.noticeEndDate,
        requiredNoticeDays: hrOffboardingCases.requiredNoticeDays,
        lastWorkingDate: hrOffboardingCases.lastWorkingDate,
        settlementReadyAt: hrOffboardingCases.settlementReadyAt,
        rehireEligibility: hrOffboardingCases.rehireEligibility,
        vacancyTriggered: hrOffboardingCases.vacancyTriggered,
        exitInterviewScheduledAt: hrOffboardingCases.exitInterviewScheduledAt,
        startedAt: hrOffboardingCases.createdAt,
        completedAt: hrOffboardingCases.completedAt,
        cancelledAt: hrOffboardingCases.cancelledAt,
        sensitiveDetails: hrOffboardingCases.sensitiveDetails,
        exitInterviewFeedback: hrOffboardingCases.exitInterviewFeedback,
      })
      .from(hrOffboardingCases)
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(
        managerEmployee,
        eq(hrEmployees.managerEmployeeId, managerEmployee.id),
      )
      .where(whereClause)
      .orderBy(desc(hrOffboardingCases.createdAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) =>
        mapOffboardingCaseRow(
          {
            ...row,
            departmentName: row.departmentName,
            managerLegalName: row.managerLegalName,
            managerPreferredName: row.managerPreferredName,
          },
          canViewSensitive,
        ),
      ),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function listHrOffboardingClearanceWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrOffboardingClearanceItems.$inferSelect)["status"];
  overdueOnly?: boolean;
}): Promise<HrOffboardingClearanceWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const now = new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOffboardingClearanceItems.organizationId, input.organizationId),
      eq(hrOffboardingCases.status, "in_progress"),
    ];

    if (input.status) {
      conditions.push(eq(hrOffboardingClearanceItems.status, input.status));
    }
    if (input.overdueOnly) {
      conditions.push(
        eq(hrOffboardingClearanceItems.status, "pending"),
        lt(hrOffboardingClearanceItems.dueDate, now),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrOffboardingClearanceItems.title, pattern),
          ilike(hrOffboardingClearanceItems.code, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOffboardingClearanceItems)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingClearanceItems.caseId, hrOffboardingCases.id),
      )
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOffboardingClearanceItems.id,
        caseId: hrOffboardingClearanceItems.caseId,
        employeeId: hrOffboardingCases.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        code: hrOffboardingClearanceItems.code,
        title: hrOffboardingClearanceItems.title,
        assigneeRole: hrOffboardingClearanceItems.assigneeRole,
        category: hrOffboardingClearanceItems.category,
        status: hrOffboardingClearanceItems.status,
        dueDate: hrOffboardingClearanceItems.dueDate,
        evidenceNote: hrOffboardingClearanceItems.evidenceNote,
        completedAt: hrOffboardingClearanceItems.completedAt,
      })
      .from(hrOffboardingClearanceItems)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingClearanceItems.caseId, hrOffboardingCases.id),
      )
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(hrOffboardingClearanceItems.sortOrder)
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        caseId: row.caseId,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        code: row.code,
        title: row.title,
        assigneeRole: row.assigneeRole,
        category: row.category,
        status: row.status,
        dueDate: row.dueDate,
        evidenceNote: row.evidenceNote,
        completedAt: row.completedAt,
        isOverdue:
          row.status === "pending" &&
          row.dueDate !== null &&
          row.dueDate.getTime() < now.getTime(),
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function startHrOffboarding(input: {
  organizationId: string;
  employeeId: string;
  exitType?: HrOffboardingExitType;
  reason?: string | null;
  effectiveDate?: Date;
  noticeStartDate?: Date | null;
  noticeEndDate?: Date | null;
  requiredNoticeDays?: number | null;
  lastWorkingDate?: Date | null;
  sensitiveDetails?: string | null;
  actorUserId?: string | null;
}): Promise<{ caseId: string; eventId: string }> {
  const noticeValidation = validateHrOffboardingNoticePeriod({
    noticeStartDate: input.noticeStartDate,
    noticeEndDate: input.noticeEndDate,
    requiredNoticeDays: input.requiredNoticeDays,
    lastWorkingDate: input.lastWorkingDate,
  });
  if (!noticeValidation.valid) {
    throw new HrOffboardingCommandError(
      "invalid_notice_period",
      noticeValidation.message,
    );
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employee = await assertOffboardingEmployeeWritable(
      db,
      input.organizationId,
      input.employeeId,
    );

    const [activeCase] = await db
      .select({ id: hrOffboardingCases.id })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.employeeId, input.employeeId),
          eq(hrOffboardingCases.status, "in_progress"),
        ),
      )
      .limit(1);

    if (activeCase) {
      throw new HrOffboardingCommandError("active_case_exists");
    }

    assertHrEmploymentStatusTransition(employee.employmentStatus, "offboarding");

    const effectiveDate = input.effectiveDate ?? new Date();
    const noticeStartDate = input.noticeStartDate ?? effectiveDate;
    const caseId = createEntityId("hr_off");
    await db.insert(hrOffboardingCases).values({
      id: caseId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      priorEmploymentStatus: employee.employmentStatus,
      exitType: input.exitType ?? "resignation",
      reason: input.reason?.trim() || null,
      effectiveDate,
      noticeStartDate,
      noticeEndDate: input.noticeEndDate ?? input.lastWorkingDate ?? null,
      requiredNoticeDays: input.requiredNoticeDays ?? DEFAULT_NOTICE_DAYS,
      lastWorkingDate: input.lastWorkingDate ?? null,
      sensitiveDetails: input.sensitiveDetails?.trim() || null,
    });

    await db.insert(hrOffboardingClearanceItems).values(
      DEFAULT_OFFBOARDING_CLEARANCE.map((item) => ({
        id: createEntityId("hr_off_clr"),
        organizationId: input.organizationId,
        caseId,
        code: item.code,
        title: item.title,
        assigneeRole: item.assigneeRole,
        category: item.category,
        sortOrder: item.sortOrder,
        dueDate: computeDueDate(effectiveDate, item.sortOrder),
      })),
    );

    await db.insert(hrOffboardingApprovalSteps).values(
      DEFAULT_OFFBOARDING_APPROVAL_STEPS.map((step) => ({
        id: createEntityId("hr_off_apr"),
        organizationId: input.organizationId,
        caseId,
        stepCode: step.stepCode,
        title: step.title,
        assigneeRole: step.assigneeRole,
        sortOrder: step.sortOrder,
      })),
    );

    await db.insert(hrOffboardingAssets).values(
      DEFAULT_OFFBOARDING_ASSETS.map((asset) => ({
        id: createEntityId("hr_off_ast"),
        organizationId: input.organizationId,
        caseId,
        assetCode: asset.assetCode,
        title: asset.title,
      })),
    );

    await db
      .update(hrEmployees)
      .set({ employmentStatus: "offboarding" })
      .where(eq(hrEmployees.id, input.employeeId));

    const eventId = await insertOffboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      kind: "offboarding_start",
      previousStatus: employee.employmentStatus,
      newStatus: "offboarding",
      effectiveDate,
      reason: input.reason,
    });

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId,
      employeeId: input.employeeId,
      action: "hr.offboarding.case.start",
      actorUserId: input.actorUserId,
      summary: "Started offboarding case",
      metadata: { exitType: input.exitType ?? "resignation", caseId },
    });

    return { caseId, eventId };
  });
}

export async function listHrOffboardingClearanceItems(input: {
  organizationId: string;
  caseId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    return db
      .select({
        id: hrOffboardingClearanceItems.id,
        caseId: hrOffboardingClearanceItems.caseId,
        code: hrOffboardingClearanceItems.code,
        title: hrOffboardingClearanceItems.title,
        assigneeRole: hrOffboardingClearanceItems.assigneeRole,
        category: hrOffboardingClearanceItems.category,
        status: hrOffboardingClearanceItems.status,
        dueDate: hrOffboardingClearanceItems.dueDate,
        evidenceNote: hrOffboardingClearanceItems.evidenceNote,
        completedAt: hrOffboardingClearanceItems.completedAt,
        sortOrder: hrOffboardingClearanceItems.sortOrder,
      })
      .from(hrOffboardingClearanceItems)
      .where(
        and(
          eq(hrOffboardingClearanceItems.organizationId, input.organizationId),
          eq(hrOffboardingClearanceItems.caseId, input.caseId),
        ),
      )
      .orderBy(hrOffboardingClearanceItems.sortOrder);
  });
}

export async function completeHrOffboardingClearanceItem(input: {
  organizationId: string;
  itemId: string;
  evidenceNote?: string | null;
  actorUserId?: string | null;
}): Promise<{ itemId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [item] = await db
      .select({
        id: hrOffboardingClearanceItems.id,
        caseId: hrOffboardingClearanceItems.caseId,
        title: hrOffboardingClearanceItems.title,
      })
      .from(hrOffboardingClearanceItems)
      .where(
        and(
          eq(hrOffboardingClearanceItems.organizationId, input.organizationId),
          eq(hrOffboardingClearanceItems.id, input.itemId),
        ),
      )
      .limit(1);

    if (!item) {
      throw new HrOffboardingCommandError("clearance_item_not_found");
    }

    await db
      .update(hrOffboardingClearanceItems)
      .set({
        status: "done",
        completedAt: new Date(),
        evidenceNote: input.evidenceNote?.trim() || null,
      })
      .where(eq(hrOffboardingClearanceItems.id, input.itemId));

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: item.caseId,
      action: "hr.offboarding.clearance.complete",
      actorUserId: input.actorUserId,
      summary: `Completed clearance item: ${item.title}`,
      metadata: { itemId: input.itemId },
    });

    return { itemId: input.itemId };
  });
}

export async function waiveHrOffboardingClearanceItem(input: {
  organizationId: string;
  itemId: string;
  evidenceNote?: string | null;
  actorUserId?: string | null;
}): Promise<{ itemId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [item] = await db
      .select({
        id: hrOffboardingClearanceItems.id,
        caseId: hrOffboardingClearanceItems.caseId,
        title: hrOffboardingClearanceItems.title,
      })
      .from(hrOffboardingClearanceItems)
      .where(
        and(
          eq(hrOffboardingClearanceItems.organizationId, input.organizationId),
          eq(hrOffboardingClearanceItems.id, input.itemId),
        ),
      )
      .limit(1);

    if (!item) {
      throw new HrOffboardingCommandError("clearance_item_not_found");
    }

    await db
      .update(hrOffboardingClearanceItems)
      .set({
        status: "waived",
        completedAt: new Date(),
        evidenceNote: input.evidenceNote?.trim() || null,
      })
      .where(eq(hrOffboardingClearanceItems.id, input.itemId));

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: item.caseId,
      action: "hr.offboarding.clearance.waive",
      actorUserId: input.actorUserId,
      summary: `Waived clearance item: ${item.title}`,
      metadata: { itemId: input.itemId },
    });

    return { itemId: input.itemId };
  });
}

export async function decideHrOffboardingApprovalStep(input: {
  organizationId: string;
  stepId: string;
  decision: "approved" | "rejected";
  actorUserId?: string | null;
}): Promise<{ stepId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [step] = await db
      .select({
        id: hrOffboardingApprovalSteps.id,
        caseId: hrOffboardingApprovalSteps.caseId,
        title: hrOffboardingApprovalSteps.title,
      })
      .from(hrOffboardingApprovalSteps)
      .where(
        and(
          eq(hrOffboardingApprovalSteps.organizationId, input.organizationId),
          eq(hrOffboardingApprovalSteps.id, input.stepId),
        ),
      )
      .limit(1);

    if (!step) {
      throw new HrOffboardingCommandError("approval_step_not_found");
    }

    await db
      .update(hrOffboardingApprovalSteps)
      .set({
        status: input.decision,
        decidedAt: new Date(),
      })
      .where(eq(hrOffboardingApprovalSteps.id, input.stepId));

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: step.caseId,
      action: `hr.offboarding.approval.${input.decision}`,
      actorUserId: input.actorUserId,
      summary: `${input.decision === "approved" ? "Approved" : "Rejected"}: ${step.title}`,
      metadata: { stepId: input.stepId },
    });

    return { stepId: input.stepId };
  });
}

export async function updateHrOffboardingAssetStatus(input: {
  organizationId: string;
  assetId: string;
  status: HrOffboardingAssetStatus;
  notes?: string | null;
  actorUserId?: string | null;
}): Promise<{ assetId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [asset] = await db
      .select({
        id: hrOffboardingAssets.id,
        caseId: hrOffboardingAssets.caseId,
        title: hrOffboardingAssets.title,
      })
      .from(hrOffboardingAssets)
      .where(
        and(
          eq(hrOffboardingAssets.organizationId, input.organizationId),
          eq(hrOffboardingAssets.id, input.assetId),
        ),
      )
      .limit(1);

    if (!asset) {
      throw new HrOffboardingCommandError("asset_not_found");
    }

    await db
      .update(hrOffboardingAssets)
      .set({
        status: input.status,
        notes: input.notes?.trim() || null,
        resolvedAt: new Date(),
      })
      .where(eq(hrOffboardingAssets.id, input.assetId));

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: asset.caseId,
      action: "hr.offboarding.asset.update",
      actorUserId: input.actorUserId,
      summary: `Updated asset ${asset.title} to ${input.status}`,
      metadata: { assetId: input.assetId, status: input.status },
    });

    return { assetId: input.assetId };
  });
}

export async function scheduleHrOffboardingExitInterview(input: {
  organizationId: string;
  caseId: string;
  scheduledAt: Date;
  actorUserId?: string | null;
}): Promise<{ caseId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrOffboardingCases)
      .set({ exitInterviewScheduledAt: input.scheduledAt })
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      );

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      action: "hr.offboarding.exit_interview.schedule",
      actorUserId: input.actorUserId,
      summary: "Scheduled exit interview",
      metadata: { scheduledAt: input.scheduledAt.toISOString() },
    });

    return { caseId: input.caseId };
  });
}

export async function recordHrOffboardingExitInterviewFeedback(input: {
  organizationId: string;
  caseId: string;
  feedback: string;
  actorUserId?: string | null;
}): Promise<{ caseId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrOffboardingCases)
      .set({ exitInterviewFeedback: input.feedback.trim() })
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      );

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      action: "hr.offboarding.exit_interview.feedback",
      actorUserId: input.actorUserId,
      summary: "Recorded exit interview feedback",
    });

    return { caseId: input.caseId };
  });
}

export async function recordHrOffboardingRehireEligibility(input: {
  organizationId: string;
  caseId: string;
  rehireEligibility: HrOffboardingRehireEligibility;
  actorUserId?: string | null;
}): Promise<{ caseId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrOffboardingCases)
      .set({ rehireEligibility: input.rehireEligibility })
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      );

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      action: "hr.offboarding.rehire.record",
      actorUserId: input.actorUserId,
      summary: `Recorded rehire eligibility: ${input.rehireEligibility}`,
    });

    return { caseId: input.caseId };
  });
}

export async function triggerHrOffboardingVacancy(input: {
  organizationId: string;
  caseId: string;
  actorUserId?: string | null;
}): Promise<{ caseId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrOffboardingCases)
      .set({ vacancyTriggered: true })
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      );

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      action: "hr.offboarding.vacancy.trigger",
      actorUserId: input.actorUserId,
      summary: "Triggered position vacancy reference",
    });

    return { caseId: input.caseId };
  });
}

export async function linkHrOffboardingDocument(input: {
  organizationId: string;
  caseId: string;
  documentKind: string;
  employeeDocumentId?: string | null;
  externalReference?: string | null;
  actorUserId?: string | null;
}): Promise<{ linkId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const linkId = createEntityId("hr_off_doc");
    await db.insert(hrOffboardingDocumentLinks).values({
      id: linkId,
      organizationId: input.organizationId,
      caseId: input.caseId,
      documentKind: input.documentKind.trim(),
      employeeDocumentId: input.employeeDocumentId ?? null,
      externalReference: input.externalReference?.trim() || null,
    });

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      action: "hr.offboarding.document.link",
      actorUserId: input.actorUserId,
      summary: `Linked exit document: ${input.documentKind}`,
      metadata: { linkId },
    });

    return { linkId };
  });
}

export async function addHrOffboardingSettlementBlocker(input: {
  organizationId: string;
  caseId: string;
  blockerCode: string;
  title: string;
  source?: string;
  actorUserId?: string | null;
}): Promise<{ blockerId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const blockerId = createEntityId("hr_off_blk");
    await db.insert(hrOffboardingSettlementBlockers).values({
      id: blockerId,
      organizationId: input.organizationId,
      caseId: input.caseId,
      blockerCode: input.blockerCode.trim(),
      title: input.title.trim(),
      source: input.source?.trim() || "payroll",
    });

    await db
      .update(hrOffboardingCases)
      .set({ settlementReadyAt: null })
      .where(eq(hrOffboardingCases.id, input.caseId));

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      action: "hr.offboarding.settlement.blocker.add",
      actorUserId: input.actorUserId,
      summary: `Payroll returned settlement blocker: ${input.title}`,
      metadata: { blockerId },
    });

    return { blockerId };
  });
}

export async function resolveHrOffboardingSettlementBlocker(input: {
  organizationId: string;
  blockerId: string;
  actorUserId?: string | null;
}): Promise<{ blockerId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [blocker] = await db
      .select({
        id: hrOffboardingSettlementBlockers.id,
        caseId: hrOffboardingSettlementBlockers.caseId,
        title: hrOffboardingSettlementBlockers.title,
      })
      .from(hrOffboardingSettlementBlockers)
      .where(
        and(
          eq(hrOffboardingSettlementBlockers.organizationId, input.organizationId),
          eq(hrOffboardingSettlementBlockers.id, input.blockerId),
        ),
      )
      .limit(1);

    if (!blocker) {
      throw new HrOffboardingCommandError("blocker_not_found");
    }

    await db
      .update(hrOffboardingSettlementBlockers)
      .set({ resolved: true, resolvedAt: new Date() })
      .where(eq(hrOffboardingSettlementBlockers.id, input.blockerId));

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: blocker.caseId,
      action: "hr.offboarding.settlement.blocker.resolve",
      actorUserId: input.actorUserId,
      summary: `Resolved settlement blocker: ${blocker.title}`,
      metadata: { blockerId: input.blockerId },
    });

    return { blockerId: input.blockerId };
  });
}

export async function markHrOffboardingSettlementReady(input: {
  organizationId: string;
  caseId: string;
  actorUserId?: string | null;
}): Promise<{ caseId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [pendingBlocker] = await db
      .select({ id: hrOffboardingSettlementBlockers.id })
      .from(hrOffboardingSettlementBlockers)
      .where(
        and(
          eq(hrOffboardingSettlementBlockers.organizationId, input.organizationId),
          eq(hrOffboardingSettlementBlockers.caseId, input.caseId),
          eq(hrOffboardingSettlementBlockers.resolved, false),
        ),
      )
      .limit(1);

    if (pendingBlocker) {
      throw new HrOffboardingCommandError("settlement_not_ready");
    }

    await db
      .update(hrOffboardingCases)
      .set({ settlementReadyAt: new Date() })
      .where(eq(hrOffboardingCases.id, input.caseId));

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      action: "hr.offboarding.settlement.ready",
      actorUserId: input.actorUserId,
      summary: "Marked final settlement ready for Payroll",
    });

    return { caseId: input.caseId };
  });
}

async function assertOffboardingPreClearanceComplete(
  db: AfendaTransaction,
  organizationId: string,
  caseId: string,
) {
  const [pendingClearance] = await db
    .select({ id: hrOffboardingClearanceItems.id })
    .from(hrOffboardingClearanceItems)
    .where(
      and(
        eq(hrOffboardingClearanceItems.organizationId, organizationId),
        eq(hrOffboardingClearanceItems.caseId, caseId),
        eq(hrOffboardingClearanceItems.status, "pending"),
      ),
    )
    .limit(1);

  if (pendingClearance) {
    throw new HrOffboardingCommandError("clearance_incomplete");
  }

  const [pendingApproval] = await db
    .select({ id: hrOffboardingApprovalSteps.id })
    .from(hrOffboardingApprovalSteps)
    .where(
      and(
        eq(hrOffboardingApprovalSteps.organizationId, organizationId),
        eq(hrOffboardingApprovalSteps.caseId, caseId),
        eq(hrOffboardingApprovalSteps.status, "pending"),
      ),
    )
    .limit(1);

  if (pendingApproval) {
    throw new HrOffboardingCommandError("approval_incomplete");
  }

  const [outstandingAsset] = await db
    .select({ id: hrOffboardingAssets.id })
    .from(hrOffboardingAssets)
    .where(
      and(
        eq(hrOffboardingAssets.organizationId, organizationId),
        eq(hrOffboardingAssets.caseId, caseId),
        eq(hrOffboardingAssets.status, "outstanding"),
      ),
    )
    .limit(1);

  if (outstandingAsset) {
    throw new HrOffboardingCommandError("clearance_incomplete");
  }
}

export async function completeHrOffboarding(input: {
  organizationId: string;
  caseId: string;
  effectiveDate?: Date;
  actorUserId?: string | null;
}): Promise<{ caseId: string; eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [offboardingCase] = await db
      .select({
        id: hrOffboardingCases.id,
        employeeId: hrOffboardingCases.employeeId,
        status: hrOffboardingCases.status,
        settlementReadyAt: hrOffboardingCases.settlementReadyAt,
      })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      )
      .limit(1);

    if (!offboardingCase) {
      throw new HrOffboardingCommandError("case_not_found");
    }
    if (offboardingCase.status !== "in_progress") {
      throw new HrOffboardingCommandError("case_not_in_progress");
    }

    await assertOffboardingPreClearanceComplete(
      db,
      input.organizationId,
      input.caseId,
    );

    if (!offboardingCase.settlementReadyAt) {
      throw new HrOffboardingCommandError("settlement_not_ready");
    }

    const employee = await assertOffboardingEmployeeWritable(
      db,
      input.organizationId,
      offboardingCase.employeeId,
    );

    assertHrEmploymentStatusTransition(employee.employmentStatus, "separated");

    const effectiveDate = input.effectiveDate ?? new Date();
    const completedAt = new Date();

    await db
      .update(hrOffboardingCases)
      .set({ status: "completed", completedAt })
      .where(eq(hrOffboardingCases.id, input.caseId));

    await db
      .update(hrEmployees)
      .set({ employmentStatus: "separated" })
      .where(eq(hrEmployees.id, offboardingCase.employeeId));

    const eventId = await insertOffboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: offboardingCase.employeeId,
      kind: "offboarding_complete",
      previousStatus: employee.employmentStatus,
      newStatus: "separated",
      effectiveDate,
    });

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      employeeId: offboardingCase.employeeId,
      action: "hr.offboarding.case.complete",
      actorUserId: input.actorUserId,
      summary: "Completed offboarding case",
      metadata: { lifecycleEventId: eventId },
    });

    return { caseId: input.caseId, eventId };
  });
}

export async function cancelHrOffboarding(input: {
  organizationId: string;
  caseId: string;
  reason?: string | null;
  actorUserId?: string | null;
}): Promise<{ caseId: string; eventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [offboardingCase] = await db
      .select({
        id: hrOffboardingCases.id,
        employeeId: hrOffboardingCases.employeeId,
        status: hrOffboardingCases.status,
        priorEmploymentStatus: hrOffboardingCases.priorEmploymentStatus,
      })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      )
      .limit(1);

    if (!offboardingCase) {
      throw new HrOffboardingCommandError("case_not_found");
    }
    if (offboardingCase.status !== "in_progress") {
      throw new HrOffboardingCommandError("case_not_in_progress");
    }

    await assertOffboardingEmployeeWritable(
      db,
      input.organizationId,
      offboardingCase.employeeId,
    );

    const cancelledAt = new Date();
    await db
      .update(hrOffboardingCases)
      .set({
        status: "cancelled",
        cancelledAt,
        reason: input.reason?.trim() || undefined,
      })
      .where(eq(hrOffboardingCases.id, input.caseId));

    await db
      .update(hrEmployees)
      .set({ employmentStatus: offboardingCase.priorEmploymentStatus })
      .where(eq(hrEmployees.id, offboardingCase.employeeId));

    const eventId = await insertOffboardingLifecycleEvent(db, {
      organizationId: input.organizationId,
      employeeId: offboardingCase.employeeId,
      kind: "offboarding_cancelled",
      previousStatus: "offboarding",
      newStatus: offboardingCase.priorEmploymentStatus,
      effectiveDate: cancelledAt,
      reason: input.reason,
    });

    await insertOffboardingAuditEventInTx(db, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      employeeId: offboardingCase.employeeId,
      action: "hr.offboarding.case.cancel",
      actorUserId: input.actorUserId,
      summary: "Cancelled offboarding case",
      metadata: { lifecycleEventId: eventId },
    });

    return { caseId: input.caseId, eventId };
  });
}

export async function getActiveHrOffboardingCaseForEmployee(input: {
  organizationId: string;
  employeeId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrOffboardingCases.id,
        status: hrOffboardingCases.status,
        lastWorkingDate: hrOffboardingCases.lastWorkingDate,
        reason: hrOffboardingCases.reason,
      })
      .from(hrOffboardingCases)
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.employeeId, input.employeeId),
          eq(hrOffboardingCases.status, "in_progress"),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}

export async function listHrOffboardingApprovalStepsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  pendingOnly?: boolean;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOffboardingApprovalSteps.organizationId, input.organizationId),
      eq(hrOffboardingCases.status, "in_progress"),
    ];
    if (input.pendingOnly) {
      conditions.push(eq(hrOffboardingApprovalSteps.status, "pending"));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrOffboardingApprovalSteps.title, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOffboardingApprovalSteps)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingApprovalSteps.caseId, hrOffboardingCases.id),
      )
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOffboardingApprovalSteps.id,
        caseId: hrOffboardingApprovalSteps.caseId,
        employeeNumber: hrEmployees.employeeNumber,
        employeeDisplayName: sql<string>`coalesce(nullif(${hrEmployees.preferredName}, ''), ${hrEmployees.legalName})`,
        stepCode: hrOffboardingApprovalSteps.stepCode,
        title: hrOffboardingApprovalSteps.title,
        assigneeRole: hrOffboardingApprovalSteps.assigneeRole,
        status: hrOffboardingApprovalSteps.status,
        decidedAt: hrOffboardingApprovalSteps.decidedAt,
      })
      .from(hrOffboardingApprovalSteps)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingApprovalSteps.caseId, hrOffboardingCases.id),
      )
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(hrOffboardingApprovalSteps.sortOrder)
      .limit(pageSize)
      .offset(offset);

    return {
      rows,
      pageSize,
      totalCount: Number(totalRow?.total ?? 0),
      hasNextPage: offset + rows.length < Number(totalRow?.total ?? 0),
    };
  });
}

export async function listHrOffboardingAssetsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  outstandingOnly?: boolean;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOffboardingAssets.organizationId, input.organizationId),
      eq(hrOffboardingCases.status, "in_progress"),
    ];
    if (input.outstandingOnly) {
      conditions.push(eq(hrOffboardingAssets.status, "outstanding"));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrOffboardingAssets.title, pattern),
          ilike(hrOffboardingAssets.assetCode, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOffboardingAssets)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingAssets.caseId, hrOffboardingCases.id),
      )
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOffboardingAssets.id,
        caseId: hrOffboardingAssets.caseId,
        employeeNumber: hrEmployees.employeeNumber,
        employeeDisplayName: sql<string>`coalesce(nullif(${hrEmployees.preferredName}, ''), ${hrEmployees.legalName})`,
        assetCode: hrOffboardingAssets.assetCode,
        title: hrOffboardingAssets.title,
        status: hrOffboardingAssets.status,
        notes: hrOffboardingAssets.notes,
        resolvedAt: hrOffboardingAssets.resolvedAt,
      })
      .from(hrOffboardingAssets)
      .innerJoin(
        hrOffboardingCases,
        eq(hrOffboardingAssets.caseId, hrOffboardingCases.id),
      )
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(hrOffboardingAssets.assetCode)
      .limit(pageSize)
      .offset(offset);

    return {
      rows,
      pageSize,
      totalCount: Number(totalRow?.total ?? 0),
      hasNextPage: offset + rows.length < Number(totalRow?.total ?? 0),
    };
  });
}

export async function listHrOffboardingSettlementWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOffboardingCases.organizationId, input.organizationId),
      eq(hrOffboardingCases.status, "in_progress"),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOffboardingCases)
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOffboardingCases.id,
        employeeNumber: hrEmployees.employeeNumber,
        employeeDisplayName: sql<string>`coalesce(nullif(${hrEmployees.preferredName}, ''), ${hrEmployees.legalName})`,
        settlementReadyAt: hrOffboardingCases.settlementReadyAt,
        lastWorkingDate: hrOffboardingCases.lastWorkingDate,
      })
      .from(hrOffboardingCases)
      .innerJoin(hrEmployees, eq(hrOffboardingCases.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrOffboardingCases.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      rows,
      pageSize,
      totalCount: Number(totalRow?.total ?? 0),
      hasNextPage: offset + rows.length < Number(totalRow?.total ?? 0),
    };
  });
}

export async function listHrOffboardingAuditEventsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOffboardingAuditEvents.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrOffboardingAuditEvents.action, pattern),
          ilike(hrOffboardingAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOffboardingAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOffboardingAuditEvents.id,
        caseId: hrOffboardingAuditEvents.caseId,
        employeeId: hrOffboardingAuditEvents.employeeId,
        action: hrOffboardingAuditEvents.action,
        actorUserId: hrOffboardingAuditEvents.actorUserId,
        summary: hrOffboardingAuditEvents.summary,
        occurredAt: hrOffboardingAuditEvents.occurredAt,
      })
      .from(hrOffboardingAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrOffboardingAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    return {
      rows,
      pageSize,
      totalCount: Number(totalRow?.total ?? 0),
      hasNextPage: offset + rows.length < Number(totalRow?.total ?? 0),
    };
  });
}

export async function getHrOffboardingSettlementReadiness(input: {
  organizationId: string;
  caseId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [offboardingCase] = await db
      .select({
        settlementReadyAt: hrOffboardingCases.settlementReadyAt,
        lastWorkingDate: hrOffboardingCases.lastWorkingDate,
      })
      .from(hrOffboardingCases)
      .where(
        and(
          eq(hrOffboardingCases.organizationId, input.organizationId),
          eq(hrOffboardingCases.id, input.caseId),
        ),
      )
      .limit(1);

    if (!offboardingCase) {
      throw new HrOffboardingCommandError("case_not_found");
    }

    const blockers = await db
      .select({
        id: hrOffboardingSettlementBlockers.id,
        blockerCode: hrOffboardingSettlementBlockers.blockerCode,
        title: hrOffboardingSettlementBlockers.title,
        resolved: hrOffboardingSettlementBlockers.resolved,
      })
      .from(hrOffboardingSettlementBlockers)
      .where(
        and(
          eq(hrOffboardingSettlementBlockers.organizationId, input.organizationId),
          eq(hrOffboardingSettlementBlockers.caseId, input.caseId),
          eq(hrOffboardingSettlementBlockers.resolved, false),
        ),
      );

    return {
      settlementReadyAt: offboardingCase.settlementReadyAt,
      blockers,
      ready: Boolean(offboardingCase.settlementReadyAt) && blockers.length === 0,
    };
  });
}
