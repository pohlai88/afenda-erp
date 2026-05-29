import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { hrDepartments, hrEmployees, hrPositions } from "./schema/hr";

const HR_DEFAULT_PAGE_SIZE = 25;
const HR_MAX_PAGE_SIZE = 100;

function clampHrPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return HR_DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return HR_DEFAULT_PAGE_SIZE;
  return Math.min(size, HR_MAX_PAGE_SIZE);
}

export type HrEmployeeDirectoryRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  email: string | null;
  employmentStatus: (typeof hrEmployees.$inferSelect)["employmentStatus"];
  departmentName: string | null;
  positionTitle: string | null;
  managerDisplayName: string | null;
  updatedAt: Date;
};

export type HrEmployeeDirectoryWindow = {
  rows: readonly HrEmployeeDirectoryRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrEmployeeDirectoryWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  includeArchived?: boolean;
}): Promise<HrEmployeeDirectoryWindow> {
  const pageSize = clampHrPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const managerEmployee = alias(hrEmployees, "manager_employee");
    const conditions = [eq(hrEmployees.organizationId, input.organizationId)];

    if (!input.includeArchived) {
      conditions.push(isNull(hrEmployees.archivedAt));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrEmployees.email, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployees)
      .where(whereClause);

    const totalCount = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        email: hrEmployees.email,
        employmentStatus: hrEmployees.employmentStatus,
        departmentName: hrDepartments.name,
        positionTitle: hrPositions.title,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        updatedAt: hrEmployees.updatedAt,
      })
      .from(hrEmployees)
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrEmployees.currentPositionId, hrPositions.id))
      .leftJoin(
        managerEmployee,
        eq(hrEmployees.managerEmployeeId, managerEmployee.id),
      )
      .where(whereClause)
      .orderBy(desc(hrEmployees.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const mapped: HrEmployeeDirectoryRow[] = rows.map((row) => ({
      id: row.id,
      employeeNumber: row.employeeNumber,
      displayName: row.preferredName?.trim() || row.legalName,
      email: row.email,
      employmentStatus: row.employmentStatus,
      departmentName: row.departmentName,
      positionTitle: row.positionTitle,
      managerDisplayName:
        row.managerPreferredName?.trim() || row.managerLegalName?.trim() || null,
      updatedAt: row.updatedAt,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount,
      hasNextPage: offset + mapped.length < totalCount,
    };
  });
}

export type HrEmployeeDetail = {
  id: string;
  employeeNumber: string;
  legalName: string;
  preferredName: string | null;
  displayName: string;
  email: string | null;
  employmentStatus: (typeof hrEmployees.$inferSelect)["employmentStatus"];
  currentDepartmentId: string | null;
  currentPositionId: string | null;
  departmentName: string | null;
  positionTitle: string | null;
  managerDisplayName: string | null;
  managerEmployeeId: string | null;
  archivedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
};

export async function getHrEmployeeDetail(input: {
  organizationId: string;
  employeeId: string;
}): Promise<HrEmployeeDetail | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const managerEmployee = alias(hrEmployees, "manager_employee");
    const [row] = await db
      .select({
        id: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        email: hrEmployees.email,
        employmentStatus: hrEmployees.employmentStatus,
        currentDepartmentId: hrEmployees.currentDepartmentId,
        currentPositionId: hrEmployees.currentPositionId,
        departmentName: hrDepartments.name,
        positionTitle: hrPositions.title,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        archivedAt: hrEmployees.archivedAt,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        updatedAt: hrEmployees.updatedAt,
        createdAt: hrEmployees.createdAt,
      })
      .from(hrEmployees)
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrEmployees.currentPositionId, hrPositions.id))
      .leftJoin(
        managerEmployee,
        eq(hrEmployees.managerEmployeeId, managerEmployee.id),
      )
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
        ),
      )
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      employeeNumber: row.employeeNumber,
      legalName: row.legalName,
      preferredName: row.preferredName,
      displayName: row.preferredName?.trim() || row.legalName,
      email: row.email,
      employmentStatus: row.employmentStatus,
      currentDepartmentId: row.currentDepartmentId,
      currentPositionId: row.currentPositionId,
      departmentName: row.departmentName,
      positionTitle: row.positionTitle,
      managerEmployeeId: row.managerEmployeeId,
      managerDisplayName:
        row.managerPreferredName?.trim() || row.managerLegalName?.trim() || null,
      archivedAt: row.archivedAt,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
    };
  });
}

export type HrReportingLineRow = {
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  managerEmployeeId: string | null;
  managerDisplayName: string | null;
  departmentName: string | null;
  positionTitle: string | null;
};

export type HrDepartmentTreeRow = {
  id: string;
  code: string;
  name: string;
  parentDepartmentName: string | null;
  orgUnitStatus: (typeof hrDepartments.$inferSelect)["orgUnitStatus"];
};

export async function listHrReportingLines(input: {
  organizationId: string;
  limit?: number;
}): Promise<readonly HrReportingLineRow[]> {
  const limit = clampHrPageSize(input.limit);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const managerEmployee = alias(hrEmployees, "manager_employee");
    const rows = await db
      .select({
        employeeId: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        departmentName: hrDepartments.name,
        positionTitle: hrPositions.title,
      })
      .from(hrEmployees)
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrEmployees.currentPositionId, hrPositions.id))
      .leftJoin(
        managerEmployee,
        eq(hrEmployees.managerEmployeeId, managerEmployee.id),
      )
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .orderBy(hrEmployees.employeeNumber)
      .limit(limit);

    return rows.map((row) => ({
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.preferredName?.trim() || row.legalName,
      managerEmployeeId: row.managerEmployeeId,
      managerDisplayName:
        row.managerPreferredName?.trim() || row.managerLegalName?.trim() || null,
      departmentName: row.departmentName,
      positionTitle: row.positionTitle,
    }));
  });
}

export async function listHrDepartmentTree(input: {
  organizationId: string;
  limit?: number;
}): Promise<readonly HrDepartmentTreeRow[]> {
  const limit = clampHrPageSize(input.limit);
  const parentDepartment = alias(hrDepartments, "parent_department");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrDepartments.id,
        code: hrDepartments.code,
        name: hrDepartments.name,
        parentDepartmentName: parentDepartment.name,
        orgUnitStatus: hrDepartments.orgUnitStatus,
      })
      .from(hrDepartments)
      .leftJoin(
        parentDepartment,
        eq(hrDepartments.parentDepartmentId, parentDepartment.id),
      )
      .where(
        and(
          eq(hrDepartments.organizationId, input.organizationId),
          isNull(hrDepartments.archivedAt),
        ),
      )
      .orderBy(hrDepartments.name)
      .limit(limit);

    return rows;
  });
}

export type HrDepartmentRow = {
  id: string;
  code: string;
  name: string;
  orgUnitStatus: (typeof hrDepartments.$inferSelect)["orgUnitStatus"];
  updatedAt: Date;
};

export type HrPositionRow = {
  id: string;
  code: string;
  title: string;
  departmentName: string;
  positionStatus: (typeof hrPositions.$inferSelect)["positionStatus"];
  updatedAt: Date;
};

export async function listHrDepartments(input: {
  organizationId: string;
  limit?: number;
}): Promise<readonly HrDepartmentRow[]> {
  const limit = clampHrPageSize(input.limit);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrDepartments.id,
        code: hrDepartments.code,
        name: hrDepartments.name,
        orgUnitStatus: hrDepartments.orgUnitStatus,
        updatedAt: hrDepartments.updatedAt,
      })
      .from(hrDepartments)
      .where(
        and(
          eq(hrDepartments.organizationId, input.organizationId),
          isNull(hrDepartments.archivedAt),
        ),
      )
      .orderBy(hrDepartments.name)
      .limit(limit);

    return rows;
  });
}

export async function listHrPositions(input: {
  organizationId: string;
  limit?: number;
}): Promise<readonly HrPositionRow[]> {
  const limit = clampHrPageSize(input.limit);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrPositions.id,
        code: hrPositions.code,
        title: hrPositions.title,
        departmentName: hrDepartments.name,
        positionStatus: hrPositions.positionStatus,
        updatedAt: hrPositions.updatedAt,
      })
      .from(hrPositions)
      .innerJoin(hrDepartments, eq(hrPositions.departmentId, hrDepartments.id))
      .where(
        and(
          eq(hrPositions.organizationId, input.organizationId),
          isNull(hrPositions.archivedAt),
        ),
      )
      .orderBy(hrPositions.title)
      .limit(limit);

    return rows;
  });
}

export type HrWorkforceSeedResult = {
  seeded: boolean;
  employeeCount: number;
};

/**
 * Idempotent Slice 1 demo workforce for dev/staging tenants.
 * Skips organizations that already have hr_employees rows.
 */
export async function seedHrWorkforceFoundation(input: {
  organizationId: string;
}): Promise<HrWorkforceSeedResult> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ total: count() })
      .from(hrEmployees)
      .where(eq(hrEmployees.organizationId, input.organizationId));

    const existingCount = Number(existing?.total ?? 0);
    if (existingCount > 0) {
      return { seeded: false, employeeCount: existingCount };
    }

    const operationsDeptId = createEntityId("hr_dept");
    const peopleDeptId = createEntityId("hr_dept");
    const leadPositionId = createEntityId("hr_pos");
    const analystPositionId = createEntityId("hr_pos");
    const managerId = createEntityId("hr_emp");
    const leadId = createEntityId("hr_emp");
    const analystId = createEntityId("hr_emp");

    await db.insert(hrDepartments).values([
      {
        id: operationsDeptId,
        organizationId: input.organizationId,
        code: "OPS",
        name: "Operations",
        orgUnitStatus: "active",
      },
      {
        id: peopleDeptId,
        organizationId: input.organizationId,
        code: "PEOPLE",
        name: "People",
        parentDepartmentId: operationsDeptId,
        orgUnitStatus: "active",
      },
    ]);

    await db.insert(hrPositions).values([
      {
        id: leadPositionId,
        organizationId: input.organizationId,
        code: "OPS-LEAD",
        title: "Operations Lead",
        departmentId: operationsDeptId,
        positionStatus: "active",
      },
      {
        id: analystPositionId,
        organizationId: input.organizationId,
        code: "OPS-ANALYST",
        title: "Operations Analyst",
        departmentId: operationsDeptId,
        positionStatus: "active",
      },
    ]);

    await db.insert(hrEmployees).values([
      {
        id: managerId,
        organizationId: input.organizationId,
        employeeNumber: "E-001",
        legalName: "Jordan Lee",
        preferredName: "Jordan",
        email: "jordan.lee@afenda.local",
        employmentStatus: "active",
        currentDepartmentId: peopleDeptId,
        currentPositionId: leadPositionId,
      },
      {
        id: leadId,
        organizationId: input.organizationId,
        employeeNumber: "E-002",
        legalName: "Alex Morgan",
        preferredName: "Alex",
        email: "alex.morgan@afenda.local",
        employmentStatus: "active",
        currentDepartmentId: operationsDeptId,
        currentPositionId: leadPositionId,
        managerEmployeeId: managerId,
      },
      {
        id: analystId,
        organizationId: input.organizationId,
        employeeNumber: "E-003",
        legalName: "Samira Patel",
        email: "samira.patel@afenda.local",
        employmentStatus: "active",
        currentDepartmentId: operationsDeptId,
        currentPositionId: analystPositionId,
        managerEmployeeId: leadId,
      },
    ]);

    return { seeded: true, employeeCount: 3 };
  });
}
