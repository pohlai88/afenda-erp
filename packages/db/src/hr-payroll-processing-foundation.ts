import { and, eq, ilike, or } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrPayrollAuditEventInTx } from "./hr-payroll-processing-audit";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import { hrEmployees } from "./schema/hr";
import {
  hrPayrollCycles,
  hrPayrollEmployeeAssignments,
  hrPayrollPayGroups,
  hrPayrollRuns,
} from "./schema/hr-payroll-processing";

/** PAY-002 — create payroll pay group. */
export async function createHrPayrollGroupInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    code: string;
    name: string;
    paySchedule: (typeof hrPayrollPayGroups.$inferInsert)["paySchedule"];
    currencyCode?: string;
    description?: string;
  },
) {
  const id = createEntityId("pay_grp");
  await db.insert(hrPayrollPayGroups).values({
    id,
    organizationId: input.organizationId,
    code: input.code,
    name: input.name,
    description: input.description ?? null,
    paySchedule: input.paySchedule,
    currencyCode: input.currencyCode ?? "USD",
    payGroupStatus: "active",
  });

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.group.created",
    summary: `Payroll group ${input.code} created.`,
    metadata: { payrollGroupId: id },
  });

  return { payrollGroupId: id };
}

/** PAY-001 — create payroll cycle. */
export async function createHrPayrollCycleInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payGroupId: string;
    code: string;
    name: string;
    periodStartAt: Date;
    periodEndAt: Date;
    cutoffAt: Date;
    payDateAt: Date;
    currencyCode?: string;
  },
) {
  const [group] = await db
    .select({ id: hrPayrollPayGroups.id })
    .from(hrPayrollPayGroups)
    .where(
      and(
        eq(hrPayrollPayGroups.organizationId, input.organizationId),
        eq(hrPayrollPayGroups.id, input.payGroupId),
      ),
    )
    .limit(1);

  if (!group) {
    throw new Error("Payroll group not found.");
  }

  const id = createEntityId("pay_cyc");
  await db.insert(hrPayrollCycles).values({
    id,
    organizationId: input.organizationId,
    payGroupId: input.payGroupId,
    code: input.code,
    name: input.name,
    periodStartAt: input.periodStartAt,
    periodEndAt: input.periodEndAt,
    cutoffAt: input.cutoffAt,
    payDateAt: input.payDateAt,
    currencyCode: input.currencyCode ?? "USD",
    cycleStatus: "draft",
  });

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: id,
    actorUserId: input.actorUserId,
    action: "hr.payroll.cycle.created",
    summary: `Payroll cycle ${input.code} created.`,
    metadata: { payGroupId: input.payGroupId },
  });

  return { payrollCycleId: id };
}

/** PAY-003 — assign employee to payroll group. */
export async function assignHrPayrollGroupEmployeeInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollGroupId: string;
    employeeId: string;
    effectiveFrom: Date;
  },
) {
  const id = createEntityId("pay_asg");
  await db.insert(hrPayrollEmployeeAssignments).values({
    id,
    organizationId: input.organizationId,
    payGroupId: input.payrollGroupId,
    employeeId: input.employeeId,
    effectiveFrom: input.effectiveFrom,
    assignedByUserId: input.actorUserId,
    assignmentStatus: "active",
    primaryAssignment: true,
  });

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.group.employee_assigned",
    summary: "Employee assigned to payroll group.",
    metadata: { payrollGroupId: input.payrollGroupId },
  });

  return { assignmentId: id };
}

/** PAY-001/021 — create payroll run for a cycle. */
export async function createHrPayrollRunInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollCycleId: string;
    runKind?: (typeof hrPayrollRuns.$inferInsert)["runKind"];
    runNumber?: number;
  },
) {
  const [cycle] = await db
    .select({ id: hrPayrollCycles.id })
    .from(hrPayrollCycles)
    .where(
      and(
        eq(hrPayrollCycles.organizationId, input.organizationId),
        eq(hrPayrollCycles.id, input.payrollCycleId),
      ),
    )
    .limit(1);

  if (!cycle) {
    throw new Error("Payroll cycle not found.");
  }

  const id = createEntityId("pay_run");
  await db.insert(hrPayrollRuns).values({
    id,
    organizationId: input.organizationId,
    cycleId: input.payrollCycleId,
    runKind: input.runKind ?? "preview",
    runStatus: "draft",
    runNumber: input.runNumber ?? 1,
    createdByUserId: input.actorUserId,
  });

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: input.payrollCycleId,
    runId: id,
    actorUserId: input.actorUserId,
    action: "hr.payroll.run.created",
    summary: "Payroll run created.",
  });

  return { payrollRunId: id };
}

export async function listHrPayrollPayGroupsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    limit?: number;
    offset?: number;
    search?: string;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [eq(hrPayrollPayGroups.organizationId, input.organizationId)];

  const trimmedSearch = input.search?.trim();
  if (trimmedSearch) {
    const pattern = `%${trimmedSearch}%`;
    conditions.push(
      or(
        ilike(hrPayrollPayGroups.code, pattern),
        ilike(hrPayrollPayGroups.name, pattern),
      )!,
    );
  }

  const whereClause = and(...conditions);
  const rows = await db
    .select({
      id: hrPayrollPayGroups.id,
      code: hrPayrollPayGroups.code,
      name: hrPayrollPayGroups.name,
      paySchedule: hrPayrollPayGroups.paySchedule,
      payGroupStatus: hrPayrollPayGroups.payGroupStatus,
      currencyCode: hrPayrollPayGroups.currencyCode,
    })
    .from(hrPayrollPayGroups)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: rows.length,
  });
}

export async function listHrPayrollCyclesWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payGroupId?: string;
    limit?: number;
    offset?: number;
    search?: string;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [eq(hrPayrollCycles.organizationId, input.organizationId)];

  if (input.payGroupId) {
    conditions.push(eq(hrPayrollCycles.payGroupId, input.payGroupId));
  }

  const trimmedSearch = input.search?.trim();
  if (trimmedSearch) {
    const pattern = `%${trimmedSearch}%`;
    conditions.push(
      or(
        ilike(hrPayrollCycles.code, pattern),
        ilike(hrPayrollCycles.name, pattern),
      )!,
    );
  }

  const whereClause = and(...conditions);
  const rows = await db
    .select({
      id: hrPayrollCycles.id,
      code: hrPayrollCycles.code,
      name: hrPayrollCycles.name,
      payGroupId: hrPayrollCycles.payGroupId,
      cycleStatus: hrPayrollCycles.cycleStatus,
      periodStartAt: hrPayrollCycles.periodStartAt,
      periodEndAt: hrPayrollCycles.periodEndAt,
      cutoffAt: hrPayrollCycles.cutoffAt,
      payDateAt: hrPayrollCycles.payDateAt,
      currencyCode: hrPayrollCycles.currencyCode,
    })
    .from(hrPayrollCycles)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: rows.length,
  });
}

export async function listHrPayrollEmployeeAssignmentsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payGroupId?: string;
    limit?: number;
    offset?: number;
    search?: string;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [
    eq(hrPayrollEmployeeAssignments.organizationId, input.organizationId),
  ];

  if (input.payGroupId) {
    conditions.push(eq(hrPayrollEmployeeAssignments.payGroupId, input.payGroupId));
  }

  const whereClause = and(...conditions);
  const rows = await db
    .select({
      id: hrPayrollEmployeeAssignments.id,
      payGroupId: hrPayrollEmployeeAssignments.payGroupId,
      employeeId: hrPayrollEmployeeAssignments.employeeId,
      employeeNumber: hrEmployees.employeeNumber,
      employeeName: hrEmployees.legalName,
      assignmentStatus: hrPayrollEmployeeAssignments.assignmentStatus,
      effectiveFrom: hrPayrollEmployeeAssignments.effectiveFrom,
      effectiveTo: hrPayrollEmployeeAssignments.effectiveTo,
    })
    .from(hrPayrollEmployeeAssignments)
    .innerJoin(
      hrEmployees,
      eq(hrPayrollEmployeeAssignments.employeeId, hrEmployees.id),
    )
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  const filtered = input.search
    ? rows.filter((row) => {
        const q = input.search!.toLowerCase();
        return (
          row.employeeNumber.toLowerCase().includes(q) ||
          row.employeeName.toLowerCase().includes(q)
        );
      })
    : rows;

  return buildPaginatedWindow({
    rows: filtered,
    pageSize,
    offset,
    totalCount: filtered.length,
  });
}
