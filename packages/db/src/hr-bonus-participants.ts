import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  buildPaginatedWindow,
  clampPageSize,
  formatEmployeeLabel,
} from "./hr-benefits.shared";
import { determineHrBonusEligibilityInTx } from "./hr-bonus-eligibility";
import { HrBonusCommandError } from "./hr-bonus-incentive.shared";
import {
  hrBonusPlanParticipants,
  hrBonusPlans,
} from "./hr-bonus-incentive";
import { hrEmployees } from "./hr";

export async function listHrBonusPlanParticipantsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  planId?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBonusPlanParticipants.organizationId, input.organizationId),
    ];

    if (input.planId?.trim()) {
      conditions.push(
        eq(hrBonusPlanParticipants.planId, input.planId.trim()),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrBonusPlans.code, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusPlanParticipants)
      .innerJoin(
        hrEmployees,
        eq(hrBonusPlanParticipants.employeeId, hrEmployees.id),
      )
      .innerJoin(hrBonusPlans, eq(hrBonusPlanParticipants.planId, hrBonusPlans.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusPlanParticipants.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        planCode: hrBonusPlans.code,
        planName: hrBonusPlans.name,
        assignmentStatus: hrBonusPlanParticipants.assignmentStatus,
        eligible: hrBonusPlanParticipants.eligible,
        ineligibilityReason: hrBonusPlanParticipants.ineligibilityReason,
        assignedAt: hrBonusPlanParticipants.assignedAt,
      })
      .from(hrBonusPlanParticipants)
      .innerJoin(
        hrEmployees,
        eq(hrBonusPlanParticipants.employeeId, hrEmployees.id),
      )
      .innerJoin(hrBonusPlans, eq(hrBonusPlanParticipants.planId, hrBonusPlans.id))
      .where(whereClause)
      .orderBy(desc(hrBonusPlanParticipants.assignedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        employeeLabel: formatEmployeeLabel(row),
        planCode: row.planCode,
        planName: row.planName,
        assignmentStatus: row.assignmentStatus,
        eligible: row.eligible,
        ineligibilityReason: row.ineligibilityReason,
        assignedAt: row.assignedAt,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function assignHrBonusPlanParticipantInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    employeeId: string;
    assignedByUserId: string;
    assignedAt?: Date;
    skipEligibilityCheck?: boolean;
  },
): Promise<{
  participantId: string;
  eligible: boolean;
  ineligibilityReason: string | null;
}> {
  const [plan] = await db
    .select({ id: hrBonusPlans.id })
    .from(hrBonusPlans)
    .where(
      and(
        eq(hrBonusPlans.organizationId, input.organizationId),
        eq(hrBonusPlans.id, input.planId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrBonusCommandError("plan_not_found");
  }

  const [employee] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrBonusCommandError("employee_not_found");
  }

  let eligible = true;
  let ineligibilityReason: string | null = null;

  if (!input.skipEligibilityCheck) {
    const determination = await determineHrBonusEligibilityInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      planId: input.planId,
      asOf: input.assignedAt,
    });
    eligible = determination.eligible;
    ineligibilityReason = determination.ineligibilityReason ?? null;
  }

  const [existing] = await db
    .select({ id: hrBonusPlanParticipants.id })
    .from(hrBonusPlanParticipants)
    .where(
      and(
        eq(hrBonusPlanParticipants.organizationId, input.organizationId),
        eq(hrBonusPlanParticipants.planId, input.planId),
        eq(hrBonusPlanParticipants.employeeId, input.employeeId),
      ),
    )
    .limit(1);

  const payload = {
    assignmentStatus: eligible ? ("assigned" as const) : ("excluded" as const),
    eligible,
    ineligibilityReason,
    assignedByUserId: input.assignedByUserId,
    assignedAt: input.assignedAt ?? new Date(),
  };

  if (existing) {
    await db
      .update(hrBonusPlanParticipants)
      .set(payload)
      .where(eq(hrBonusPlanParticipants.id, existing.id));
    return {
      participantId: existing.id,
      eligible,
      ineligibilityReason,
    };
  }

  const participantId = createEntityId("hr_bon_part");
  await db.insert(hrBonusPlanParticipants).values({
    id: participantId,
    organizationId: input.organizationId,
    planId: input.planId,
    employeeId: input.employeeId,
    ...payload,
  });

  return { participantId, eligible, ineligibilityReason };
}

export async function removeHrBonusPlanParticipantInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    participantId: string;
  },
): Promise<{ participantId: string }> {
  const [participant] = await db
    .select({ id: hrBonusPlanParticipants.id })
    .from(hrBonusPlanParticipants)
    .where(
      and(
        eq(hrBonusPlanParticipants.organizationId, input.organizationId),
        eq(hrBonusPlanParticipants.id, input.participantId),
      ),
    )
    .limit(1);

  if (!participant) {
    throw new HrBonusCommandError("participant_not_found");
  }

  await db
    .delete(hrBonusPlanParticipants)
    .where(eq(hrBonusPlanParticipants.id, participant.id));

  return { participantId: participant.id };
}
