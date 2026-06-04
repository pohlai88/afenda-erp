import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { clampPageSize } from "./list-window.shared";
import {
  appendHrGeoAuditEvent,
  publishHrGeoOutcomeToLam,
  startOfUtcDay,
} from "./hr-geolocation";
import { hrEmployees } from "./hr";
import {
  hrGeoCheckinOutcomes,
  hrGeoExceptions,
  hrGeoRawCheckins,
} from "./dbx-hr-geolocation";

export class HrGeoWorkflowError extends Error {
  readonly code:
    | "exception_not_found"
    | "invalid_decision"
    | "reason_required"
    | "raw_checkin_not_found";

  constructor(code: HrGeoWorkflowError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export async function submitHrGeoException(input: {
  organizationId: string;
  rawCheckinId: string;
  employeeId: string;
  submissionReason: string;
  actorAuthUserId: string;
  approverAuthUserId?: string | null;
}): Promise<{ exceptionId: string }> {
  const exceptionId = createEntityId("hr_geo_exc");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    const [raw] = await db
      .select({ id: hrGeoRawCheckins.id })
      .from(hrGeoRawCheckins)
      .where(
        and(
          eq(hrGeoRawCheckins.organizationId, input.organizationId),
          eq(hrGeoRawCheckins.id, input.rawCheckinId),
          eq(hrGeoRawCheckins.employeeId, input.employeeId),
        ),
      )
      .limit(1);

    if (!raw) {
      throw new HrGeoWorkflowError("raw_checkin_not_found");
    }

    await db.insert(hrGeoExceptions).values({
      id: exceptionId,
      organizationId: input.organizationId,
      rawCheckinId: input.rawCheckinId,
      employeeId: input.employeeId,
      status: "pending",
      submissionReason: input.submissionReason.trim(),
      currentApproverAuthUserId: input.approverAuthUserId ?? null,
    });
  });

  await appendHrGeoAuditEvent({
    organizationId: input.organizationId,
    action: "exception_submitted",
    auditKey: "erp.hrm.geo.exception.submitted",
    actorAuthUserId: input.actorAuthUserId,
    employeeId: input.employeeId,
    rawCheckinId: input.rawCheckinId,
    exceptionId,
  });

  return { exceptionId };
}

export async function decideHrGeoException(input: {
  organizationId: string;
  exceptionId: string;
  decision: "approve" | "reject" | "return" | "correct" | "manual_approve";
  decisionReason?: string | null;
  actorAuthUserId: string;
}): Promise<{ outcomeId: string | null; status: string }> {
  if (
    (input.decision === "reject" ||
      input.decision === "correct" ||
      input.decision === "manual_approve") &&
    !input.decisionReason?.trim()
  ) {
    throw new HrGeoWorkflowError("reason_required");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [exception] = await db
      .select()
      .from(hrGeoExceptions)
      .where(
        and(
          eq(hrGeoExceptions.organizationId, input.organizationId),
          eq(hrGeoExceptions.id, input.exceptionId),
        ),
      )
      .limit(1);

    if (!exception) {
      throw new HrGeoWorkflowError("exception_not_found");
    }

    const [outcome] = await db
      .select()
      .from(hrGeoCheckinOutcomes)
      .where(
        and(
          eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
          eq(hrGeoCheckinOutcomes.rawCheckinId, exception.rawCheckinId),
        ),
      )
      .limit(1);

    if (!outcome) {
      throw new HrGeoWorkflowError("raw_checkin_not_found");
    }

    const [raw] = await db
      .select({ capturedAt: hrGeoRawCheckins.capturedAt, action: hrGeoRawCheckins.action })
      .from(hrGeoRawCheckins)
      .where(eq(hrGeoRawCheckins.id, exception.rawCheckinId))
      .limit(1);

    let nextExceptionStatus: (typeof hrGeoExceptions.$inferSelect)["status"] =
      "pending";
    let nextOutcomeStatus: (typeof hrGeoCheckinOutcomes.$inferSelect)["status"] =
      outcome.status;

    switch (input.decision) {
      case "approve":
      case "manual_approve":
        nextExceptionStatus = input.decision === "manual_approve" ? "corrected" : "approved";
        nextOutcomeStatus = input.decision === "manual_approve" ? "corrected" : "verified";
        break;
      case "reject":
        nextExceptionStatus = "rejected";
        nextOutcomeStatus = "rejected";
        break;
      case "return":
        nextExceptionStatus = "returned";
        nextOutcomeStatus = "pending_review";
        break;
      case "correct":
        nextExceptionStatus = "corrected";
        nextOutcomeStatus = "corrected";
        break;
      default:
        throw new HrGeoWorkflowError("invalid_decision");
    }

    await db
      .update(hrGeoExceptions)
      .set({
        status: nextExceptionStatus,
        decision: input.decision,
        decisionReason: input.decisionReason?.trim() ?? null,
        decidedAt: new Date(),
        outcomeId: outcome.id,
      })
      .where(eq(hrGeoExceptions.id, input.exceptionId));

    await db
      .update(hrGeoCheckinOutcomes)
      .set({
        status: nextOutcomeStatus,
        decisionReason: input.decisionReason?.trim() ?? null,
        verifiedAt:
          nextOutcomeStatus === "verified" || nextOutcomeStatus === "corrected"
            ? raw?.capturedAt ?? new Date()
            : null,
        payrollDayReference:
          nextOutcomeStatus === "verified" || nextOutcomeStatus === "corrected"
            ? `hrm_attendance_day:${outcome.employeeId}:${startOfUtcDay(outcome.workDate).toISOString().slice(0, 10)}`
            : outcome.payrollDayReference,
      })
      .where(eq(hrGeoCheckinOutcomes.id, outcome.id));

    await appendHrGeoAuditEvent({
      organizationId: input.organizationId,
      action: "exception_decided",
      auditKey: "erp.hrm.geo.exception.decided",
      actorAuthUserId: input.actorAuthUserId,
      employeeId: exception.employeeId,
      rawCheckinId: exception.rawCheckinId,
      outcomeId: outcome.id,
      exceptionId: input.exceptionId,
      metadata: { decision: input.decision },
    });

    if (nextOutcomeStatus === "verified" || nextOutcomeStatus === "corrected") {
      await publishHrGeoOutcomeToLam({
        organizationId: input.organizationId,
        outcomeId: outcome.id,
        employeeId: outcome.employeeId,
        action: raw?.action ?? outcome.action,
        capturedAt: raw?.capturedAt ?? new Date(),
        actorAuthUserId: input.actorAuthUserId,
      });
    }

    return { outcomeId: outcome.id, status: nextExceptionStatus };
  });
}

export async function listHrGeoPendingExceptionsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  visibleEmployeeIds?: readonly string[] | null;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoExceptions.organizationId, input.organizationId),
      eq(hrGeoExceptions.status, "pending"),
    ];

    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoExceptions.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrGeoExceptions.submissionReason, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoExceptions)
      .innerJoin(hrEmployees, eq(hrGeoExceptions.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrGeoExceptions.id,
        employeeId: hrGeoExceptions.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        rawCheckinId: hrGeoExceptions.rawCheckinId,
        submissionReason: hrGeoExceptions.submissionReason,
        submittedAt: hrGeoExceptions.submittedAt,
        validationFlags: hrGeoRawCheckins.validationFlags,
      })
      .from(hrGeoExceptions)
      .innerJoin(hrEmployees, eq(hrGeoExceptions.employeeId, hrEmployees.id))
      .innerJoin(
        hrGeoRawCheckins,
        eq(hrGeoExceptions.rawCheckinId, hrGeoRawCheckins.id),
      )
      .where(whereClause)
      .orderBy(desc(hrGeoExceptions.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
        rawCheckinId: row.rawCheckinId,
        submissionReason: row.submissionReason,
        submittedAt: row.submittedAt,
        validationFlags: row.validationFlags,
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

