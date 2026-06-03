import { and, desc, eq, gte, lte } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  appendHrFwaAuditEvent,
  getHrFwaArrangementById,
  getHrFwaSchedulePattern,
  getOrCreateDefaultHrFwaPolicyGroup,
  listHrFwaPolicyGroups,
  HrFwaCommandError,
} from "./hr-fwa";
import {
  hrFwaComplianceBreaches,
  hrFwaComplianceBreachKindEnum,
  hrFwaComplianceBreachStatusEnum,
} from "./hr";

export type HrFwaComplianceBreachKind =
  (typeof hrFwaComplianceBreachKindEnum.enumValues)[number];

export type HrFwaComplianceBreachStatus =
  (typeof hrFwaComplianceBreachStatusEnum.enumValues)[number];

export type HrFwaComplianceBreachRow = {
  id: string;
  arrangementId: string;
  employeeId: string;
  breachKind: HrFwaComplianceBreachKind;
  status: HrFwaComplianceBreachStatus;
  periodStart: Date;
  periodEnd: Date;
  expectedValue: string | null;
  actualValue: string | null;
  description: string;
  detectedAt: Date;
  resolvedAt: Date | null;
};

export type HrFwaWeeklyScheduleMetrics = {
  officeDays: number;
  remoteDays: number;
  workDays: number;
  expectedWeeklyHours: number | null;
};

export function computeHrFwaWeeklyScheduleMetrics(input: {
  patternDetails: import("./schema/hr").HrFwaSchedulePatternDetails;
}): HrFwaWeeklyScheduleMetrics {
  const details = input.patternDetails;
  return {
    officeDays: details.officeDays?.length ?? 0,
    remoteDays: details.remoteDays?.length ?? 0,
    workDays: details.workDays?.length ?? 0,
    expectedWeeklyHours: details.expectedWeeklyHours ?? null,
  };
}

export async function checkHrFwaPolicyLimits(input: {
  organizationId: string;
  arrangementId: string;
  periodStart: Date;
  periodEnd: Date;
  observedOfficeDays: number;
  observedRemoteDays: number;
}): Promise<readonly HrFwaComplianceBreachKind[]> {
  const arrangement = await getHrFwaArrangementById({
    organizationId: input.organizationId,
    arrangementId: input.arrangementId,
  });

  const policy = await getOrCreateDefaultHrFwaPolicyGroup({
    organizationId: input.organizationId,
  });

  const policyGroups = await listHrFwaPolicyGroups({
    organizationId: input.organizationId,
    activeOnly: true,
  });
  const group =
    policyGroups.find((g) => g.code === arrangement.policyGroupCode) ?? policy;

  const breaches: HrFwaComplianceBreachKind[] = [];

  if (
    group.minOfficeDaysPerWeek !== null &&
    input.observedOfficeDays < group.minOfficeDaysPerWeek
  ) {
    breaches.push("missed_office_days");
  }

  if (
    group.maxRemoteDaysPerWeek !== null &&
    input.observedRemoteDays > group.maxRemoteDaysPerWeek
  ) {
    breaches.push("excessive_remote_days");
  }

  if (arrangement.schedulePatternId) {
    const pattern = await getHrFwaSchedulePattern({
      organizationId: input.organizationId,
      schedulePatternId: arrangement.schedulePatternId,
    });
    const metrics = computeHrFwaWeeklyScheduleMetrics({
      patternDetails: pattern.patternDetails,
    });

    if (
      metrics.officeDays > 0 &&
      input.observedOfficeDays < metrics.officeDays
    ) {
      if (!breaches.includes("missed_office_days")) {
        breaches.push("missed_office_days");
      }
    }
    if (
      metrics.remoteDays > 0 &&
      input.observedRemoteDays > metrics.remoteDays
    ) {
      if (!breaches.includes("excessive_remote_days")) {
        breaches.push("excessive_remote_days");
      }
    }
  }

  return breaches;
}

export async function recordHrFwaComplianceBreach(input: {
  organizationId: string;
  arrangementId: string;
  employeeId: string;
  breachKind: HrFwaComplianceBreachKind;
  periodStart: Date;
  periodEnd: Date;
  description: string;
  expectedValue?: string | null;
  actualValue?: string | null;
}): Promise<{ breachId: string }> {
  const description = input.description.trim();
  if (!description) {
    throw new HrFwaCommandError("not_eligible", "Breach description required");
  }

  const breachId = createEntityId("hr_fwa_brch");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrFwaComplianceBreaches).values({
      id: breachId,
      organizationId: input.organizationId,
      arrangementId: input.arrangementId,
      employeeId: input.employeeId,
      breachKind: input.breachKind,
      description,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      expectedValue: input.expectedValue ?? null,
      actualValue: input.actualValue ?? null,
    });
  });

  await appendHrFwaAuditEvent({
    organizationId: input.organizationId,
    action: "compliance_breach",
    summary: description,
    arrangementId: input.arrangementId,
    employeeId: input.employeeId,
    metadata: {
      breachKind: input.breachKind,
      expectedValue: input.expectedValue,
      actualValue: input.actualValue,
    },
  });

  return { breachId };
}

export async function listHrFwaComplianceBreaches(input: {
  organizationId: string;
  arrangementId?: string;
  employeeId?: string;
  status?: HrFwaComplianceBreachStatus;
  detectedFrom?: Date;
  detectedTo?: Date;
  limit?: number;
}): Promise<readonly HrFwaComplianceBreachRow[]> {
  const pageSize = Math.min(input.limit ?? 50, 100);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrFwaComplianceBreaches.organizationId, input.organizationId),
    ];

    if (input.arrangementId) {
      conditions.push(
        eq(hrFwaComplianceBreaches.arrangementId, input.arrangementId),
      );
    }
    if (input.employeeId) {
      conditions.push(eq(hrFwaComplianceBreaches.employeeId, input.employeeId));
    }
    if (input.status) {
      conditions.push(eq(hrFwaComplianceBreaches.status, input.status));
    }
    if (input.detectedFrom) {
      conditions.push(
        gte(hrFwaComplianceBreaches.detectedAt, input.detectedFrom),
      );
    }
    if (input.detectedTo) {
      conditions.push(lte(hrFwaComplianceBreaches.detectedAt, input.detectedTo));
    }

    const rows = await db
      .select()
      .from(hrFwaComplianceBreaches)
      .where(and(...conditions))
      .orderBy(desc(hrFwaComplianceBreaches.detectedAt))
      .limit(pageSize);

    return rows.map((row) => ({
      id: row.id,
      arrangementId: row.arrangementId,
      employeeId: row.employeeId,
      breachKind: row.breachKind,
      status: row.status,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      expectedValue: row.expectedValue,
      actualValue: row.actualValue,
      description: row.description,
      detectedAt: row.detectedAt,
      resolvedAt: row.resolvedAt,
    }));
  });
}

export async function resolveHrFwaComplianceBreach(input: {
  organizationId: string;
  breachId: string;
  resolutionNote: string;
  status?: "resolved" | "waived";
}): Promise<{ breachId: string }> {
  const note = input.resolutionNote.trim();
  if (!note) {
    throw new HrFwaCommandError("not_eligible", "Resolution note required");
  }

  await runWithOrganizationContext(input.organizationId, async (db) => {
    const [breach] = await db
      .select()
      .from(hrFwaComplianceBreaches)
      .where(
        and(
          eq(hrFwaComplianceBreaches.organizationId, input.organizationId),
          eq(hrFwaComplianceBreaches.id, input.breachId),
        ),
      )
      .limit(1);

    if (!breach) {
      throw new HrFwaCommandError("arrangement_not_found", "Breach not found");
    }

    await db
      .update(hrFwaComplianceBreaches)
      .set({
        status: input.status ?? "resolved",
        resolutionNote: note,
        resolvedAt: new Date(),
      })
      .where(eq(hrFwaComplianceBreaches.id, input.breachId));
  });

  return { breachId: input.breachId };
}

export async function monitorHrFwaArrangementCompliance(input: {
  organizationId: string;
  arrangementId: string;
  periodStart: Date;
  periodEnd: Date;
  observedOfficeDays: number;
  observedRemoteDays: number;
  unapprovedRemoteLocation?: boolean;
  incompleteAttendance?: boolean;
}): Promise<{ breachIds: readonly string[] }> {
  const arrangement = await getHrFwaArrangementById({
    organizationId: input.organizationId,
    arrangementId: input.arrangementId,
  });

  const breachKinds = await checkHrFwaPolicyLimits({
    organizationId: input.organizationId,
    arrangementId: input.arrangementId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    observedOfficeDays: input.observedOfficeDays,
    observedRemoteDays: input.observedRemoteDays,
  });

  const allKinds = [...breachKinds];
  if (input.unapprovedRemoteLocation) {
    allKinds.push("unapproved_remote_location");
  }
  if (input.incompleteAttendance) {
    allKinds.push("incomplete_attendance");
  }

  const breachIds: string[] = [];
  for (const kind of allKinds) {
    const { breachId } = await recordHrFwaComplianceBreach({
      organizationId: input.organizationId,
      arrangementId: input.arrangementId,
      employeeId: arrangement.employeeId,
      breachKind: kind,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      description: `Policy breach detected: ${kind}`,
      expectedValue:
        kind === "missed_office_days"
          ? String(input.observedOfficeDays)
          : kind === "excessive_remote_days"
            ? String(input.observedRemoteDays)
            : null,
      actualValue: null,
    });
    breachIds.push(breachId);
  }

  return { breachIds };
}
