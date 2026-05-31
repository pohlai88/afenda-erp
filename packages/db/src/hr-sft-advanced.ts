import { and, count, desc, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { hrAttendanceDays, hrDepartments, hrEmployees } from "./schema/hr";
import {
  hrShiftAssignments,
  hrShiftAuditEvents,
  hrShiftNotifications,
  hrShiftRosterPublications,
  hrShiftRosterReportDefinitions,
  hrShiftTemplates,
  type HrShiftRosterReportFilterPayload,
} from "./schema/hr-shift-scheduling";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (!limit || limit < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(limit), MAX_PAGE_SIZE);
}

function toUtcDayStart(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export type HrShiftNotificationRow = {
  id: string;
  recipientAuthUserId: string;
  kind: string;
  subjectType: string;
  subjectId: string;
  employeeId: string | null;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

export type HrShiftNotificationWindow = {
  rows: readonly HrShiftNotificationRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftRosterPublicationRow = {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  publishedByAuthUserId: string;
  publishedAt: Date;
  notes: string | null;
};

export type HrShiftRosterPublicationWindow = {
  rows: readonly HrShiftRosterPublicationRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftAuditEventRow = {
  id: string;
  action: string;
  summary: string;
  actorAuthUserId: string | null;
  employeeId: string | null;
  assignmentId: string | null;
  publicationId: string | null;
  occurredAt: Date;
};

export type HrShiftAuditTrailWindow = {
  rows: readonly HrShiftAuditEventRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftPayrollReferenceRow = {
  referenceId: string;
  kind: "planned_overtime" | "shift_premium" | "rest_day_work" | "holiday_work";
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  shiftDate: Date;
  templateCode: string;
  templateName: string;
  assignmentKind: string;
  shiftCategory: string;
  readyForPayroll: boolean;
};

export type HrShiftAttendanceReconcileRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  shiftDate: Date;
  scheduledTemplateCode: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  assignmentStatus: string;
  attendanceStatus: string | null;
  attendanceDayState: string | null;
  aligned: boolean;
  mismatchReason: string | null;
};

export type HrShiftAttendanceReconcileWindow = {
  rows: readonly HrShiftAttendanceReconcileRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftRosterReportDefinitionRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  filterPayload: HrShiftRosterReportFilterPayload;
  createdByAuthUserId: string;
  createdAt: Date;
};

export type HrShiftRosterReportDefinitionWindow = {
  rows: readonly HrShiftRosterReportDefinitionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftScheduleReportRow = {
  groupKey: string;
  groupLabel: string;
  periodLabel: string | null;
  assignmentCount: number;
  publishedCount: number;
  employeeCount: number;
};

/** HRM-SFT-025 — idempotent org in-app notification enqueue. */
export async function enqueueHrShiftNotification(input: {
  organizationId: string;
  recipientAuthUserId: string;
  kind: (typeof hrShiftNotifications.$inferInsert)["kind"];
  subjectType: string;
  subjectId: string;
  employeeId?: string | null;
  title: string;
  body: string;
}): Promise<{ notificationId: string; created: boolean }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrShiftNotifications.id })
      .from(hrShiftNotifications)
      .where(
        and(
          eq(hrShiftNotifications.organizationId, input.organizationId),
          eq(
            hrShiftNotifications.recipientAuthUserId,
            input.recipientAuthUserId,
          ),
          eq(hrShiftNotifications.kind, input.kind),
          eq(hrShiftNotifications.subjectType, input.subjectType),
          eq(hrShiftNotifications.subjectId, input.subjectId),
        ),
      )
      .limit(1);

    if (existing) {
      return { notificationId: existing.id, created: false };
    }

    const notificationId = createEntityId("hr_sft_ntf");
    await db.insert(hrShiftNotifications).values({
      id: notificationId,
      organizationId: input.organizationId,
      recipientAuthUserId: input.recipientAuthUserId,
      kind: input.kind,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      employeeId: input.employeeId ?? null,
      title: input.title,
      body: input.body,
    });

    return { notificationId, created: true };
  });
}

/** HRM-SFT-025 — list shift scheduling notifications. */
export async function listHrShiftNotificationsWindow(input: {
  organizationId: string;
  recipientAuthUserId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrShiftNotificationWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftNotifications.organizationId, input.organizationId),
    ];

    if (input.recipientAuthUserId) {
      conditions.push(
        eq(
          hrShiftNotifications.recipientAuthUserId,
          input.recipientAuthUserId,
        ),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrShiftNotifications.title, pattern),
          ilike(hrShiftNotifications.body, pattern),
          ilike(hrShiftNotifications.kind, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftNotifications)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftNotifications.id,
        recipientAuthUserId: hrShiftNotifications.recipientAuthUserId,
        kind: hrShiftNotifications.kind,
        subjectType: hrShiftNotifications.subjectType,
        subjectId: hrShiftNotifications.subjectId,
        employeeId: hrShiftNotifications.employeeId,
        title: hrShiftNotifications.title,
        body: hrShiftNotifications.body,
        readAt: hrShiftNotifications.readAt,
        createdAt: hrShiftNotifications.createdAt,
      })
      .from(hrShiftNotifications)
      .where(whereClause)
      .orderBy(desc(hrShiftNotifications.createdAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

/** HRM-SFT-025 — publish roster for period and stamp assignments. */
export async function publishHrShiftRosterForPeriod(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  publishedByAuthUserId: string;
  notes?: string | null;
}): Promise<{ publicationId: string; publishedAssignmentCount: number }> {
  const periodStart = toUtcDayStart(input.periodStart);
  const periodEnd = toUtcDayStart(input.periodEnd);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const publicationId = createEntityId("hr_sft_pub");
    const publishedAt = new Date();

    await db.insert(hrShiftRosterPublications).values({
      id: publicationId,
      organizationId: input.organizationId,
      periodStart,
      periodEnd,
      publishedByAuthUserId: input.publishedByAuthUserId,
      publishedAt,
      notes: input.notes?.trim() || null,
    });

    const scheduled = await db
      .select({ id: hrShiftAssignments.id, employeeId: hrShiftAssignments.employeeId })
      .from(hrShiftAssignments)
      .where(
        and(
          eq(hrShiftAssignments.organizationId, input.organizationId),
          eq(hrShiftAssignments.status, "scheduled"),
          gte(hrShiftAssignments.shiftDate, periodStart),
          lte(hrShiftAssignments.shiftDate, periodEnd),
        ),
      );

    if (scheduled.length > 0) {
      await db
        .update(hrShiftAssignments)
        .set({
          status: "published",
          publishedAt,
          publicationId,
        })
        .where(
          inArray(
            hrShiftAssignments.id,
            scheduled.map((row) => row.id),
          ),
        );
    }

    return {
      publicationId,
      publishedAssignmentCount: scheduled.length,
    };
  });
}

/** List roster publication history. */
export async function listHrShiftRosterPublicationsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrShiftRosterPublicationWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftRosterPublications.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrShiftRosterPublications.notes, pattern),
          ilike(hrShiftRosterPublications.publishedByAuthUserId, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftRosterPublications)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftRosterPublications.id,
        periodStart: hrShiftRosterPublications.periodStart,
        periodEnd: hrShiftRosterPublications.periodEnd,
        publishedByAuthUserId: hrShiftRosterPublications.publishedByAuthUserId,
        publishedAt: hrShiftRosterPublications.publishedAt,
        notes: hrShiftRosterPublications.notes,
      })
      .from(hrShiftRosterPublications)
      .where(whereClause)
      .orderBy(desc(hrShiftRosterPublications.publishedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

/** HRM-SFT-030 — append shift scheduling audit event. */
export async function appendHrShiftAuditEvent(input: {
  organizationId: string;
  action: (typeof hrShiftAuditEvents.$inferInsert)["action"];
  summary: string;
  templateId?: string | null;
  assignmentId?: string | null;
  swapRequestId?: string | null;
  scheduleChangeRequestId?: string | null;
  publicationId?: string | null;
  employeeId?: string | null;
  actorAuthUserId?: string | null;
  actorEmployeeId?: string | null;
  metadata?: Record<string, unknown> | null;
  occurredAt?: Date;
}): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_sft_audit");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrShiftAuditEvents).values({
      id: auditEventId,
      organizationId: input.organizationId,
      action: input.action,
      templateId: input.templateId ?? null,
      assignmentId: input.assignmentId ?? null,
      swapRequestId: input.swapRequestId ?? null,
      scheduleChangeRequestId: input.scheduleChangeRequestId ?? null,
      publicationId: input.publicationId ?? null,
      employeeId: input.employeeId ?? null,
      actorAuthUserId: input.actorAuthUserId ?? null,
      actorEmployeeId: input.actorEmployeeId ?? null,
      summary: input.summary.trim(),
      metadata: input.metadata ?? null,
      occurredAt: input.occurredAt ?? new Date(),
    });
  });

  return { auditEventId };
}

/** HRM-SFT-030 — paginated shift audit trail. */
export async function listHrShiftAuditEventsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  assignmentId?: string;
}): Promise<HrShiftAuditTrailWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAuditEvents.organizationId, input.organizationId),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrShiftAuditEvents.employeeId, input.employeeId));
    }
    if (input.assignmentId) {
      conditions.push(eq(hrShiftAuditEvents.assignmentId, input.assignmentId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrShiftAuditEvents.summary, pattern),
          ilike(hrShiftAuditEvents.action, pattern),
          ilike(hrShiftAuditEvents.actorAuthUserId, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftAuditEvents.id,
        action: hrShiftAuditEvents.action,
        summary: hrShiftAuditEvents.summary,
        actorAuthUserId: hrShiftAuditEvents.actorAuthUserId,
        employeeId: hrShiftAuditEvents.employeeId,
        assignmentId: hrShiftAuditEvents.assignmentId,
        publicationId: hrShiftAuditEvents.publicationId,
        occurredAt: hrShiftAuditEvents.occurredAt,
      })
      .from(hrShiftAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrShiftAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

function resolvePayrollRefKind(input: {
  assignmentKind: string;
  shiftCategory: string;
  patternKind: string;
}): HrShiftPayrollReferenceRow["kind"] | null {
  if (input.assignmentKind === "rest_day") {
    return "rest_day_work";
  }
  if (input.assignmentKind === "holiday") {
    return "holiday_work";
  }
  if (input.shiftCategory === "night" || input.shiftCategory === "evening") {
    return "shift_premium";
  }
  if (
    input.patternKind === "rotating" ||
    input.patternKind === "weekend" ||
    input.patternKind === "split"
  ) {
    return "planned_overtime";
  }
  return null;
}

function buildPayrollReferenceId(assignmentId: string, kind: string): string {
  return `hr-sft:${kind}:${assignmentId}`;
}

/** HRM-SFT-027 — payroll references for published assignments in period. */
export async function listShiftPayrollReferencesForPeriod(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  employeeId?: string;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<readonly HrShiftPayrollReferenceRow[]> {
  const periodStart = toUtcDayStart(input.periodStart);
  const periodEnd = toUtcDayStart(input.periodEnd);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAssignments.organizationId, input.organizationId),
      inArray(hrShiftAssignments.status, ["published", "scheduled"]),
      gte(hrShiftAssignments.shiftDate, periodStart),
      lte(hrShiftAssignments.shiftDate, periodEnd),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrShiftAssignments.employeeId, input.employeeId));
    }
    if (input.visibleEmployeeIds && input.visibleEmployeeIds.length > 0) {
      conditions.push(
        inArray(hrShiftAssignments.employeeId, [...input.visibleEmployeeIds]),
      );
    }

    const rows = await db
      .select({
        assignmentId: hrShiftAssignments.id,
        employeeId: hrShiftAssignments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        shiftDate: hrShiftAssignments.shiftDate,
        assignmentKind: hrShiftAssignments.assignmentKind,
        status: hrShiftAssignments.status,
        payrollReference: hrShiftAssignments.payrollReference,
        templateCode: hrShiftTemplates.code,
        templateName: hrShiftTemplates.name,
        shiftCategory: hrShiftTemplates.shiftCategory,
        patternKind: hrShiftTemplates.patternKind,
      })
      .from(hrShiftAssignments)
      .innerJoin(hrEmployees, eq(hrShiftAssignments.employeeId, hrEmployees.id))
      .innerJoin(
        hrShiftTemplates,
        eq(hrShiftAssignments.templateId, hrShiftTemplates.id),
      )
      .where(and(...conditions))
      .orderBy(hrShiftAssignments.shiftDate);

    const references: HrShiftPayrollReferenceRow[] = [];

    for (const row of rows) {
      const kind = resolvePayrollRefKind({
        assignmentKind: row.assignmentKind,
        shiftCategory: row.shiftCategory,
        patternKind: row.patternKind,
      });
      if (!kind) {
        continue;
      }

      references.push({
        referenceId:
          row.payrollReference ?? buildPayrollReferenceId(row.assignmentId, kind),
        kind,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        shiftDate: row.shiftDate,
        templateCode: row.templateCode,
        templateName: row.templateName,
        assignmentKind: row.assignmentKind,
        shiftCategory: row.shiftCategory,
        readyForPayroll: row.status === "published",
      });
    }

    return references;
  });
}

/** HRM-SFT-026 — compare scheduled shifts with LAM attendance days. */
export async function listHrShiftAttendanceReconcileWindow(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrShiftAttendanceReconcileWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const periodStart = toUtcDayStart(input.periodStart);
  const periodEnd = toUtcDayStart(input.periodEnd);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAssignments.organizationId, input.organizationId),
      inArray(hrShiftAssignments.status, ["published", "scheduled"]),
      gte(hrShiftAssignments.shiftDate, periodStart),
      lte(hrShiftAssignments.shiftDate, periodEnd),
    ];

    if (input.employeeId) {
      conditions.push(eq(hrShiftAssignments.employeeId, input.employeeId));
    }
    if (input.visibleEmployeeIds && input.visibleEmployeeIds.length > 0) {
      conditions.push(
        inArray(hrShiftAssignments.employeeId, [...input.visibleEmployeeIds]),
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
          ilike(hrShiftTemplates.code, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftAssignments)
      .innerJoin(hrEmployees, eq(hrShiftAssignments.employeeId, hrEmployees.id))
      .innerJoin(
        hrShiftTemplates,
        eq(hrShiftAssignments.templateId, hrShiftTemplates.id),
      )
      .where(whereClause);

    const assignmentRows = await db
      .select({
        id: hrShiftAssignments.id,
        employeeId: hrShiftAssignments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        shiftDate: hrShiftAssignments.shiftDate,
        shiftStart: hrShiftAssignments.shiftStart,
        shiftEnd: hrShiftAssignments.shiftEnd,
        status: hrShiftAssignments.status,
        templateCode: hrShiftTemplates.code,
      })
      .from(hrShiftAssignments)
      .innerJoin(hrEmployees, eq(hrShiftAssignments.employeeId, hrEmployees.id))
      .innerJoin(
        hrShiftTemplates,
        eq(hrShiftAssignments.templateId, hrShiftTemplates.id),
      )
      .where(whereClause)
      .orderBy(desc(hrShiftAssignments.shiftDate))
      .limit(pageSize)
      .offset(offset);

    const reconcileRows: HrShiftAttendanceReconcileRow[] = [];

    for (const assignment of assignmentRows) {
      const [attendance] = await db
        .select({
          status: hrAttendanceDays.status,
          dayState: hrAttendanceDays.dayState,
        })
        .from(hrAttendanceDays)
        .where(
          and(
            eq(hrAttendanceDays.organizationId, input.organizationId),
            eq(hrAttendanceDays.employeeId, assignment.employeeId),
            eq(hrAttendanceDays.workDate, assignment.shiftDate),
          ),
        )
        .limit(1);

      const attendanceStatus = attendance?.status ?? null;
      const attendanceDayState = attendance?.dayState ?? null;

      let aligned = true;
      let mismatchReason: string | null = null;

      if (!attendance) {
        aligned = false;
        mismatchReason = "missing_attendance_record";
      } else if (
        attendance.status === "absent" ||
        attendance.status === "missing_punch"
      ) {
        aligned = false;
        mismatchReason = "scheduled_but_absent";
      }

      reconcileRows.push({
        id: assignment.id,
        employeeId: assignment.employeeId,
        employeeNumber: assignment.employeeNumber,
        employeeDisplayName:
          assignment.preferredName?.trim() || assignment.legalName,
        shiftDate: assignment.shiftDate,
        scheduledTemplateCode: assignment.templateCode,
        scheduledStart: assignment.shiftStart,
        scheduledEnd: assignment.shiftEnd,
        assignmentStatus: assignment.status,
        attendanceStatus,
        attendanceDayState,
        aligned,
        mismatchReason,
      });
    }

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: reconcileRows,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + reconcileRows.length < actualTotal,
    };
  });
}

/** HRM-SFT-028 — save roster report definition. */
export async function saveHrShiftRosterReportDefinition(input: {
  organizationId: string;
  code: string;
  name: string;
  description?: string | null;
  filterPayload: HrShiftRosterReportFilterPayload;
  createdByAuthUserId: string;
}): Promise<{ definitionId: string }> {
  const code = input.code.trim();
  const name = input.name.trim();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrShiftRosterReportDefinitions.id })
      .from(hrShiftRosterReportDefinitions)
      .where(
        and(
          eq(hrShiftRosterReportDefinitions.organizationId, input.organizationId),
          eq(hrShiftRosterReportDefinitions.code, code),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrShiftRosterReportDefinitions)
        .set({
          name,
          description: input.description?.trim() || null,
          filterPayload: input.filterPayload,
        })
        .where(eq(hrShiftRosterReportDefinitions.id, existing.id));
      return { definitionId: existing.id };
    }

    const definitionId = createEntityId("hr_sft_rpt");
    await db.insert(hrShiftRosterReportDefinitions).values({
      id: definitionId,
      organizationId: input.organizationId,
      code,
      name,
      description: input.description?.trim() || null,
      filterPayload: input.filterPayload,
      createdByAuthUserId: input.createdByAuthUserId,
    });

    return { definitionId };
  });
}

export async function listHrShiftRosterReportDefinitionsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrShiftRosterReportDefinitionWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftRosterReportDefinitions.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrShiftRosterReportDefinitions.code, pattern),
          ilike(hrShiftRosterReportDefinitions.name, pattern),
          ilike(hrShiftRosterReportDefinitions.description, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftRosterReportDefinitions)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftRosterReportDefinitions.id,
        code: hrShiftRosterReportDefinitions.code,
        name: hrShiftRosterReportDefinitions.name,
        description: hrShiftRosterReportDefinitions.description,
        filterPayload: hrShiftRosterReportDefinitions.filterPayload,
        createdByAuthUserId: hrShiftRosterReportDefinitions.createdByAuthUserId,
        createdAt: hrShiftRosterReportDefinitions.createdAt,
      })
      .from(hrShiftRosterReportDefinitions)
      .where(whereClause)
      .orderBy(hrShiftRosterReportDefinitions.name)
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export type HrShiftReportGroupBy =
  | "employee"
  | "department"
  | "manager"
  | "location"
  | "role"
  | "period";

/** HRM-SFT-028 — aggregate shift schedule report rows. */
export async function queryHrShiftScheduleReportRows(input: {
  organizationId: string;
  groupBy: HrShiftReportGroupBy;
  periodStart: Date;
  periodEnd: Date;
  filter?: HrShiftRosterReportFilterPayload;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<readonly HrShiftScheduleReportRow[]> {
  const periodStart = toUtcDayStart(input.periodStart);
  const periodEnd = toUtcDayStart(input.periodEnd);
  const filter = input.filter ?? {};

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAssignments.organizationId, input.organizationId),
      gte(hrShiftAssignments.shiftDate, periodStart),
      lte(hrShiftAssignments.shiftDate, periodEnd),
    ];

    if (filter.employeeId) {
      conditions.push(eq(hrShiftAssignments.employeeId, filter.employeeId));
    }
    if (filter.departmentId) {
      conditions.push(eq(hrShiftAssignments.departmentId, filter.departmentId));
    }
    if (filter.locationCode) {
      conditions.push(eq(hrShiftAssignments.locationCode, filter.locationCode));
    }
    if (filter.templateId) {
      conditions.push(eq(hrShiftAssignments.templateId, filter.templateId));
    }
    if (filter.managerEmployeeId) {
      conditions.push(
        eq(hrEmployees.managerEmployeeId, filter.managerEmployeeId),
      );
    }
    if (input.visibleEmployeeIds && input.visibleEmployeeIds.length > 0) {
      conditions.push(
        inArray(hrShiftAssignments.employeeId, [...input.visibleEmployeeIds]),
      );
    }

    const rows = await db
      .select({
        employeeId: hrShiftAssignments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrShiftAssignments.departmentId,
        departmentName: hrDepartments.name,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        locationCode: hrShiftAssignments.locationCode,
        positionId: hrShiftAssignments.positionId,
        shiftDate: hrShiftAssignments.shiftDate,
        status: hrShiftAssignments.status,
      })
      .from(hrShiftAssignments)
      .innerJoin(hrEmployees, eq(hrShiftAssignments.employeeId, hrEmployees.id))
      .leftJoin(
        hrDepartments,
        eq(hrShiftAssignments.departmentId, hrDepartments.id),
      )
      .where(and(...conditions));

    const aggregates = new Map<
      string,
      {
        groupKey: string;
        groupLabel: string;
        periodLabel: string | null;
        assignmentCount: number;
        publishedCount: number;
        employees: Set<string>;
      }
    >();

    for (const row of rows) {
      let groupKey: string;
      let groupLabel: string;
      const periodLabel = row.shiftDate.toISOString().slice(0, 7);

      switch (input.groupBy) {
        case "employee":
          groupKey = row.employeeId;
          groupLabel =
            row.preferredName?.trim() ||
            row.legalName ||
            row.employeeNumber;
          break;
        case "department":
          groupKey = row.departmentId ?? "unassigned";
          groupLabel = row.departmentName ?? "Unassigned";
          break;
        case "manager":
          groupKey = row.managerEmployeeId ?? "unassigned";
          groupLabel = row.managerEmployeeId ?? "No manager";
          break;
        case "location":
          groupKey = row.locationCode ?? "unassigned";
          groupLabel = row.locationCode ?? "Unassigned";
          break;
        case "role":
          groupKey = row.positionId ?? "unassigned";
          groupLabel = row.positionId ?? "Unassigned";
          break;
        case "period":
          groupKey = periodLabel;
          groupLabel = periodLabel;
          break;
        default:
          groupKey = row.employeeId;
          groupLabel = row.employeeNumber;
      }

      const aggKey =
        input.groupBy === "period" ? groupKey : `${groupKey}:${periodLabel}`;
      const existing = aggregates.get(aggKey) ?? {
        groupKey,
        groupLabel,
        periodLabel: input.groupBy === "period" ? null : periodLabel,
        assignmentCount: 0,
        publishedCount: 0,
        employees: new Set<string>(),
      };

      existing.assignmentCount += 1;
      if (row.status === "published") {
        existing.publishedCount += 1;
      }
      existing.employees.add(row.employeeId);
      aggregates.set(aggKey, existing);
    }

    return [...aggregates.values()]
      .map((agg) => ({
        groupKey: agg.groupKey,
        groupLabel: agg.groupLabel,
        periodLabel: agg.periodLabel,
        assignmentCount: agg.assignmentCount,
        publishedCount: agg.publishedCount,
        employeeCount: agg.employees.size,
      }))
      .sort((a, b) => a.groupLabel.localeCompare(b.groupLabel));
  });
}
