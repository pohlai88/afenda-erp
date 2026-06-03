import { and, count, eq, isNull, or, sql } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { hrDepartments, hrEmployees, hrPositions } from "./hr";

export type HrOrgOverviewSnapshot = {
  orgUnitCount: number;
  positionCount: number;
  filledPositionCount: number;
  vacantPositionCount: number;
  activeEmployeeCount: number;
  plannedOrgUnitCount: number;
};

function currentEffectiveClause(asOf: Date) {
  return and(
    sql`${hrDepartments.effectiveFrom} <= ${asOf}`,
    or(isNull(hrDepartments.effectiveTo), sql`${hrDepartments.effectiveTo} > ${asOf}`),
  )!;
}

function currentPositionEffectiveClause(asOf: Date) {
  return and(
    sql`${hrPositions.effectiveFrom} <= ${asOf}`,
    or(isNull(hrPositions.effectiveTo), sql`${hrPositions.effectiveTo} > ${asOf}`),
  )!;
}

/** HRM-ORG-019/020 posture snapshot for governed overview surfaces. */
export async function loadHrOrgOverviewSnapshot(input: {
  organizationId: string;
  asOf?: Date;
}): Promise<HrOrgOverviewSnapshot> {
  const asOf = input.asOf ?? new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const orgBase = and(
      eq(hrDepartments.organizationId, input.organizationId),
      isNull(hrDepartments.archivedAt),
      currentEffectiveClause(asOf),
    );

    const positionBase = and(
      eq(hrPositions.organizationId, input.organizationId),
      isNull(hrPositions.archivedAt),
      currentPositionEffectiveClause(asOf),
      eq(hrPositions.positionStatus, "active"),
    );

    const [
      orgUnitRow,
      plannedOrgRow,
      positionRow,
      filledRow,
      employeeRow,
    ] = await Promise.all([
      db.select({ total: count() }).from(hrDepartments).where(orgBase),
      db
        .select({ total: count() })
        .from(hrDepartments)
        .where(and(orgBase, eq(hrDepartments.orgUnitStatus, "planned"))),
      db.select({ total: count() }).from(hrPositions).where(positionBase),
      db
        .select({ total: count() })
        .from(hrPositions)
        .innerJoin(
          hrEmployees,
          and(
            eq(hrEmployees.currentPositionId, hrPositions.id),
            eq(hrEmployees.organizationId, input.organizationId),
            isNull(hrEmployees.archivedAt),
          ),
        )
        .where(positionBase),
      db
        .select({ total: count() })
        .from(hrEmployees)
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            isNull(hrEmployees.archivedAt),
            eq(hrEmployees.employmentStatus, "active"),
          ),
        ),
    ]);

    const positionCount = Number(positionRow[0]?.total ?? 0);
    const filledPositionCount = Number(filledRow[0]?.total ?? 0);

    return {
      orgUnitCount: Number(orgUnitRow[0]?.total ?? 0),
      positionCount,
      filledPositionCount,
      vacantPositionCount: Math.max(0, positionCount - filledPositionCount),
      activeEmployeeCount: Number(employeeRow[0]?.total ?? 0),
      plannedOrgUnitCount: Number(plannedOrgRow[0]?.total ?? 0),
    };
  });
}
