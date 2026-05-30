import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  hrDepartments,
  hrEmployees,
  hrOrgStructureAuditEvents,
  hrPositions,
  hrReportingRelationships,
} from "./schema/hr";

const HR_DEFAULT_PAGE_SIZE = 25;
const HR_MAX_PAGE_SIZE = 100;

export class HrOrgCommandError extends Error {
  readonly code:
    | "self_parent"
    | "circular_hierarchy"
    | "org_unit_not_found"
    | "position_not_found"
    | "employee_not_found"
    | "department_not_found"
    | "invalid_effective_date"
    | "duplicate_code";

  constructor(
    code: HrOrgCommandError["code"],
    message: string,
  ) {
    super(message);
    this.name = "HrOrgCommandError";
    this.code = code;
  }
}

export type HrOrgUnitType =
  (typeof hrDepartments.$inferSelect)["unitType"];

export type HrOrgUnitStatus =
  (typeof hrDepartments.$inferSelect)["orgUnitStatus"];

export type HrPositionOccupancyStatus =
  | "filled"
  | "vacant"
  | "planned"
  | "frozen"
  | "closed";

export type HrReportingRelationshipType =
  (typeof hrReportingRelationships.$inferSelect)["relationshipType"];

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return HR_DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return HR_DEFAULT_PAGE_SIZE;
  return Math.min(size, HR_MAX_PAGE_SIZE);
}

function currentOrgUnitEffectiveClause(asOf: Date) {
  return and(
    lte(hrDepartments.effectiveFrom, asOf),
    or(isNull(hrDepartments.effectiveTo), sql`${hrDepartments.effectiveTo} > ${asOf}`),
  )!;
}

function currentPositionEffectiveClause(asOf: Date) {
  return and(
    lte(hrPositions.effectiveFrom, asOf),
    or(isNull(hrPositions.effectiveTo), sql`${hrPositions.effectiveTo} > ${asOf}`),
  )!;
}

export function deriveHrPositionOccupancyStatus(input: {
  positionStatus: HrOrgUnitStatus;
  hasActiveAssignee: boolean;
}): HrPositionOccupancyStatus {
  if (input.positionStatus === "planned") return "planned";
  if (input.positionStatus === "frozen") return "frozen";
  if (input.positionStatus === "closed") return "closed";
  return input.hasActiveAssignee ? "filled" : "vacant";
}

async function insertOrgStructureAuditEvent(
  db: Parameters<Parameters<typeof runWithOrganizationContext>[1]>[0],
  input: {
    organizationId: string;
    entityType: (typeof hrOrgStructureAuditEvents.$inferSelect)["entityType"];
    entityId: string;
    action: (typeof hrOrgStructureAuditEvents.$inferSelect)["action"];
    previousPayload?: string | null;
    newPayload: string;
    effectiveFrom?: Date | null;
    changedByUserId?: string | null;
  },
) {
  await db.insert(hrOrgStructureAuditEvents).values({
    id: createEntityId("hr_org_audit"),
    organizationId: input.organizationId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    previousPayload: input.previousPayload ?? null,
    newPayload: input.newPayload,
    effectiveFrom: input.effectiveFrom ?? null,
    changedByUserId: input.changedByUserId ?? null,
  });
}

async function assertNoOrgUnitHierarchyLoop(
  db: Parameters<Parameters<typeof runWithOrganizationContext>[1]>[0],
  input: {
    organizationId: string;
    unitId: string;
    parentDepartmentId: string | null | undefined;
  },
) {
  const parentId = input.parentDepartmentId?.trim() || null;
  if (!parentId) return;
  if (parentId === input.unitId) {
    throw new HrOrgCommandError(
      "self_parent",
      "An organization unit cannot be its own parent.",
    );
  }

  let current: string | null = parentId;
  const visited = new Set<string>();
  while (current) {
    if (current === input.unitId) {
      throw new HrOrgCommandError(
        "circular_hierarchy",
        "Organization hierarchy would create a circular relationship.",
      );
    }
    if (visited.has(current)) break;
    visited.add(current);

    const [row] = await db
      .select({ parentDepartmentId: hrDepartments.parentDepartmentId })
      .from(hrDepartments)
      .where(
        and(
          eq(hrDepartments.organizationId, input.organizationId),
          eq(hrDepartments.id, current),
        ),
      )
      .limit(1);

    current = row?.parentDepartmentId ?? null;
  }
}

export type HrOrgUnitRow = {
  id: string;
  code: string;
  name: string;
  unitType: HrOrgUnitType;
  parentDepartmentId: string | null;
  parentDepartmentName: string | null;
  managerEmployeeId: string | null;
  managerDisplayName: string | null;
  costCenterCode: string | null;
  locationCode: string | null;
  legalEntityCode: string | null;
  orgUnitStatus: HrOrgUnitStatus;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  updatedAt: Date;
};

export type HrOrgUnitWindow = {
  rows: readonly HrOrgUnitRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrOrgUnitsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  unitType?: HrOrgUnitType;
  orgUnitStatus?: HrOrgUnitStatus;
  locationCode?: string;
  legalEntityCode?: string;
  includeArchived?: boolean;
  asOf?: Date;
  includeFuture?: boolean;
}): Promise<HrOrgUnitWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const asOf = input.asOf ?? new Date();
  const parentDepartment = alias(hrDepartments, "parent_department");
  const managerEmployee = alias(hrEmployees, "manager_employee");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrDepartments.organizationId, input.organizationId)];

    if (!input.includeArchived) {
      conditions.push(isNull(hrDepartments.archivedAt));
    }

    if (!input.includeFuture) {
      conditions.push(currentOrgUnitEffectiveClause(asOf));
    }

    if (input.unitType) {
      conditions.push(eq(hrDepartments.unitType, input.unitType));
    }
    if (input.orgUnitStatus) {
      conditions.push(eq(hrDepartments.orgUnitStatus, input.orgUnitStatus));
    }
    if (input.locationCode?.trim()) {
      conditions.push(eq(hrDepartments.locationCode, input.locationCode.trim()));
    }
    if (input.legalEntityCode?.trim()) {
      conditions.push(
        eq(hrDepartments.legalEntityCode, input.legalEntityCode.trim()),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrDepartments.code, pattern),
          ilike(hrDepartments.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrDepartments)
      .where(whereClause);

    const totalCount = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrDepartments.id,
        code: hrDepartments.code,
        name: hrDepartments.name,
        unitType: hrDepartments.unitType,
        parentDepartmentId: hrDepartments.parentDepartmentId,
        parentDepartmentName: parentDepartment.name,
        managerEmployeeId: hrDepartments.managerEmployeeId,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        costCenterCode: hrDepartments.costCenterCode,
        locationCode: hrDepartments.locationCode,
        legalEntityCode: hrDepartments.legalEntityCode,
        orgUnitStatus: hrDepartments.orgUnitStatus,
        effectiveFrom: hrDepartments.effectiveFrom,
        effectiveTo: hrDepartments.effectiveTo,
        updatedAt: hrDepartments.updatedAt,
      })
      .from(hrDepartments)
      .leftJoin(
        parentDepartment,
        eq(hrDepartments.parentDepartmentId, parentDepartment.id),
      )
      .leftJoin(
        managerEmployee,
        eq(hrDepartments.managerEmployeeId, managerEmployee.id),
      )
      .where(whereClause)
      .orderBy(hrDepartments.name)
      .limit(pageSize)
      .offset(offset);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        unitType: row.unitType,
        parentDepartmentId: row.parentDepartmentId,
        parentDepartmentName: row.parentDepartmentName,
        managerEmployeeId: row.managerEmployeeId,
        managerDisplayName:
          row.managerPreferredName?.trim() ||
          row.managerLegalName?.trim() ||
          null,
        costCenterCode: row.costCenterCode,
        locationCode: row.locationCode,
        legalEntityCode: row.legalEntityCode,
        orgUnitStatus: row.orgUnitStatus,
        effectiveFrom: row.effectiveFrom,
        effectiveTo: row.effectiveTo,
        updatedAt: row.updatedAt,
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export type HrOrgPositionRow = {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  departmentName: string;
  managerEmployeeId: string | null;
  managerDisplayName: string | null;
  costCenterCode: string | null;
  locationCode: string | null;
  positionStatus: HrOrgUnitStatus;
  occupancyStatus: HrPositionOccupancyStatus;
  assigneeDisplayName: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  updatedAt: Date;
};

export type HrOrgPositionWindow = {
  rows: readonly HrOrgPositionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrOrgPositionsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  departmentId?: string;
  positionStatus?: HrOrgUnitStatus;
  occupancyStatus?: HrPositionOccupancyStatus;
  locationCode?: string;
  includeArchived?: boolean;
  asOf?: Date;
}): Promise<HrOrgPositionWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const asOf = input.asOf ?? new Date();
  const managerEmployee = alias(hrEmployees, "manager_employee");
  const assigneeEmployee = alias(hrEmployees, "assignee_employee");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrPositions.organizationId, input.organizationId),
      currentPositionEffectiveClause(asOf),
    ];

    if (!input.includeArchived) {
      conditions.push(isNull(hrPositions.archivedAt));
    }
    if (input.departmentId) {
      conditions.push(eq(hrPositions.departmentId, input.departmentId));
    }
    if (input.positionStatus) {
      conditions.push(eq(hrPositions.positionStatus, input.positionStatus));
    }
    if (input.locationCode?.trim()) {
      conditions.push(eq(hrPositions.locationCode, input.locationCode.trim()));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrPositions.code, pattern),
          ilike(hrPositions.title, pattern),
          ilike(hrDepartments.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrPositions)
      .innerJoin(hrDepartments, eq(hrPositions.departmentId, hrDepartments.id))
      .where(whereClause);

    const totalCount = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrPositions.id,
        code: hrPositions.code,
        title: hrPositions.title,
        departmentId: hrPositions.departmentId,
        departmentName: hrDepartments.name,
        managerEmployeeId: hrPositions.managerEmployeeId,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        costCenterCode: hrPositions.costCenterCode,
        locationCode: hrPositions.locationCode,
        positionStatus: hrPositions.positionStatus,
        assigneeLegalName: assigneeEmployee.legalName,
        assigneePreferredName: assigneeEmployee.preferredName,
        assigneeId: assigneeEmployee.id,
        effectiveFrom: hrPositions.effectiveFrom,
        effectiveTo: hrPositions.effectiveTo,
        updatedAt: hrPositions.updatedAt,
      })
      .from(hrPositions)
      .innerJoin(hrDepartments, eq(hrPositions.departmentId, hrDepartments.id))
      .leftJoin(
        managerEmployee,
        eq(hrPositions.managerEmployeeId, managerEmployee.id),
      )
      .leftJoin(
        assigneeEmployee,
        and(
          eq(assigneeEmployee.currentPositionId, hrPositions.id),
          eq(assigneeEmployee.organizationId, input.organizationId),
          isNull(assigneeEmployee.archivedAt),
        ),
      )
      .where(whereClause)
      .orderBy(hrPositions.title)
      .limit(pageSize)
      .offset(offset);

    const mapped = rows.map((row) => {
      const hasActiveAssignee = Boolean(row.assigneeId);
      const occupancyStatus = deriveHrPositionOccupancyStatus({
        positionStatus: row.positionStatus,
        hasActiveAssignee,
      });
      return {
        id: row.id,
        code: row.code,
        title: row.title,
        departmentId: row.departmentId,
        departmentName: row.departmentName,
        managerEmployeeId: row.managerEmployeeId,
        managerDisplayName:
          row.managerPreferredName?.trim() ||
          row.managerLegalName?.trim() ||
          null,
        costCenterCode: row.costCenterCode,
        locationCode: row.locationCode,
        positionStatus: row.positionStatus,
        occupancyStatus,
        assigneeDisplayName:
          row.assigneePreferredName?.trim() ||
          row.assigneeLegalName?.trim() ||
          null,
        effectiveFrom: row.effectiveFrom,
        effectiveTo: row.effectiveTo,
        updatedAt: row.updatedAt,
      };
    });

    const filtered =
      input.occupancyStatus !== undefined
        ? mapped.filter((row) => row.occupancyStatus === input.occupancyStatus)
        : mapped;

    return {
      rows: filtered,
      pageSize,
      totalCount:
        input.occupancyStatus !== undefined ? filtered.length : totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export type HrOrgReportingLineRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  managerEmployeeId: string;
  managerDisplayName: string;
  relationshipType: HrReportingRelationshipType;
  departmentName: string | null;
  positionTitle: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type HrOrgReportingLineWindow = {
  rows: readonly HrOrgReportingLineRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrOrgReportingLinesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  relationshipType?: HrReportingRelationshipType;
  managerEmployeeId?: string;
  asOf?: Date;
}): Promise<HrOrgReportingLineWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const asOf = input.asOf ?? new Date();
  const managerEmployee = alias(hrEmployees, "manager_employee");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrReportingRelationships.organizationId, input.organizationId),
      eq(hrReportingRelationships.assignmentStatus, "active"),
      lte(hrReportingRelationships.effectiveFrom, asOf),
      or(
        isNull(hrReportingRelationships.effectiveTo),
        sql`${hrReportingRelationships.effectiveTo} > ${asOf}`,
      ),
    ];

    if (input.relationshipType) {
      conditions.push(
        eq(hrReportingRelationships.relationshipType, input.relationshipType),
      );
    }
    if (input.managerEmployeeId) {
      conditions.push(
        eq(hrReportingRelationships.managerEmployeeId, input.managerEmployeeId),
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
          ilike(managerEmployee.legalName, pattern),
          ilike(managerEmployee.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrReportingRelationships)
      .innerJoin(
        hrEmployees,
        eq(hrReportingRelationships.employeeId, hrEmployees.id),
      )
      .innerJoin(
        managerEmployee,
        eq(hrReportingRelationships.managerEmployeeId, managerEmployee.id),
      )
      .where(whereClause);

    const totalCount = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrReportingRelationships.id,
        employeeId: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        managerEmployeeId: hrReportingRelationships.managerEmployeeId,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        relationshipType: hrReportingRelationships.relationshipType,
        departmentName: hrDepartments.name,
        positionTitle: hrPositions.title,
        effectiveFrom: hrReportingRelationships.effectiveFrom,
        effectiveTo: hrReportingRelationships.effectiveTo,
      })
      .from(hrReportingRelationships)
      .innerJoin(
        hrEmployees,
        eq(hrReportingRelationships.employeeId, hrEmployees.id),
      )
      .innerJoin(
        managerEmployee,
        eq(hrReportingRelationships.managerEmployeeId, managerEmployee.id),
      )
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrEmployees.currentPositionId, hrPositions.id))
      .where(whereClause)
      .orderBy(hrEmployees.employeeNumber)
      .limit(pageSize)
      .offset(offset);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        managerEmployeeId: row.managerEmployeeId,
        managerDisplayName:
          row.managerPreferredName?.trim() || row.managerLegalName,
        relationshipType: row.relationshipType,
        departmentName: row.departmentName,
        positionTitle: row.positionTitle,
        effectiveFrom: row.effectiveFrom,
        effectiveTo: row.effectiveTo,
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export type HrOrgHeadcountRow = {
  orgUnitId: string;
  orgUnitCode: string;
  orgUnitName: string;
  unitType: HrOrgUnitType;
  filledHeadcount: number;
  vacantPositionCount: number;
  totalPositionCount: number;
};

export type HrOrgHeadcountWindow = {
  rows: readonly HrOrgHeadcountRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrOrgHeadcountWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  unitType?: HrOrgUnitType;
  locationCode?: string;
  legalEntityCode?: string;
  asOf?: Date;
}): Promise<HrOrgHeadcountWindow> {
  const units = await listHrOrgUnitsWindow({
    organizationId: input.organizationId,
    limit: clampPageSize(input.limit),
    offset: input.offset,
    search: input.search,
    unitType: input.unitType,
    locationCode: input.locationCode,
    legalEntityCode: input.legalEntityCode,
    asOf: input.asOf,
  });

  const positions = await listHrOrgPositionsWindow({
    organizationId: input.organizationId,
    limit: HR_MAX_PAGE_SIZE,
    asOf: input.asOf,
  });

  const rows = units.rows.map((unit) => {
    const unitPositions = positions.rows.filter(
      (position) => position.departmentId === unit.id,
    );
    const filledHeadcount = unitPositions.filter(
      (position) => position.occupancyStatus === "filled",
    ).length;
    const vacantPositionCount = unitPositions.filter(
      (position) => position.occupancyStatus === "vacant",
    ).length;

    return {
      orgUnitId: unit.id,
      orgUnitCode: unit.code,
      orgUnitName: unit.name,
      unitType: unit.unitType,
      filledHeadcount,
      vacantPositionCount,
      totalPositionCount: unitPositions.length,
    };
  });

  return {
    rows,
    pageSize: units.pageSize,
    totalCount: units.totalCount,
    hasNextPage: units.hasNextPage,
  };
}

export type HrOrgAuditTrailRow = {
  id: string;
  entityType: (typeof hrOrgStructureAuditEvents.$inferSelect)["entityType"];
  entityId: string;
  action: (typeof hrOrgStructureAuditEvents.$inferSelect)["action"];
  effectiveFrom: Date | null;
  changedByUserId: string | null;
  createdAt: Date;
  summary: string;
};

export type HrOrgAuditTrailWindow = {
  rows: readonly HrOrgAuditTrailRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrOrgStructureAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrOrgAuditTrailWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOrgStructureAuditEvents.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrOrgStructureAuditEvents.entityId, pattern),
          ilike(hrOrgStructureAuditEvents.newPayload, pattern),
          ilike(hrOrgStructureAuditEvents.previousPayload, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOrgStructureAuditEvents)
      .where(whereClause);

    const totalCount = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrOrgStructureAuditEvents.id,
        entityType: hrOrgStructureAuditEvents.entityType,
        entityId: hrOrgStructureAuditEvents.entityId,
        action: hrOrgStructureAuditEvents.action,
        effectiveFrom: hrOrgStructureAuditEvents.effectiveFrom,
        changedByUserId: hrOrgStructureAuditEvents.changedByUserId,
        createdAt: hrOrgStructureAuditEvents.createdAt,
        newPayload: hrOrgStructureAuditEvents.newPayload,
      })
      .from(hrOrgStructureAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrOrgStructureAuditEvents.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        entityType: row.entityType,
        entityId: row.entityId,
        action: row.action,
        effectiveFrom: row.effectiveFrom,
        changedByUserId: row.changedByUserId,
        createdAt: row.createdAt,
        summary: `${row.entityType} ${row.action}`,
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

export type HrOrgChartNode = {
  id: string;
  code: string;
  name: string;
  unitType: HrOrgUnitType;
  parentDepartmentId: string | null;
  managerDisplayName: string | null;
  orgUnitStatus: HrOrgUnitStatus;
  childCount: number;
};

export async function loadHrOrgChartTreeNodes(input: {
  organizationId: string;
  asOf?: Date;
}): Promise<readonly HrOrgChartNode[]> {
  const window = await listHrOrgUnitsWindow({
    organizationId: input.organizationId,
    limit: HR_MAX_PAGE_SIZE,
    asOf: input.asOf,
  });

  const childCounts = new Map<string, number>();
  for (const unit of window.rows) {
    if (unit.parentDepartmentId) {
      childCounts.set(
        unit.parentDepartmentId,
        (childCounts.get(unit.parentDepartmentId) ?? 0) + 1,
      );
    }
  }

  return window.rows.map((unit) => ({
    id: unit.id,
    code: unit.code,
    name: unit.name,
    unitType: unit.unitType,
    parentDepartmentId: unit.parentDepartmentId,
    managerDisplayName: unit.managerDisplayName,
    orgUnitStatus: unit.orgUnitStatus,
    childCount: childCounts.get(unit.id) ?? 0,
  }));
}

export type HrManagerChainEntry = {
  employeeId: string;
  employeeDisplayName: string;
  managerEmployeeId: string | null;
  managerDisplayName: string | null;
  depth: number;
};

export async function resolveHrManagerApprovalChain(input: {
  organizationId: string;
  employeeId: string;
  maxDepth?: number;
}): Promise<readonly HrManagerChainEntry[]> {
  const maxDepth = input.maxDepth ?? 10;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const chain: HrManagerChainEntry[] = [];
    let currentEmployeeId: string | null = input.employeeId;
    let depth = 0;

    while (currentEmployeeId && depth < maxDepth) {
      const managerEmployee = alias(hrEmployees, "manager_employee");
      const [row] = await db
        .select({
          id: hrEmployees.id,
          legalName: hrEmployees.legalName,
          preferredName: hrEmployees.preferredName,
          managerEmployeeId: hrEmployees.managerEmployeeId,
          managerLegalName: managerEmployee.legalName,
          managerPreferredName: managerEmployee.preferredName,
        })
        .from(hrEmployees)
        .leftJoin(
          managerEmployee,
          eq(hrEmployees.managerEmployeeId, managerEmployee.id),
        )
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            eq(hrEmployees.id, currentEmployeeId),
          ),
        )
        .limit(1);

      if (!row) break;

      chain.push({
        employeeId: row.id,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        managerEmployeeId: row.managerEmployeeId,
        managerDisplayName:
          row.managerPreferredName?.trim() ||
          row.managerLegalName?.trim() ||
          null,
        depth,
      });

      currentEmployeeId = row.managerEmployeeId;
      depth += 1;
    }

    return chain;
  });
}

export async function resolveHrEscalationPath(input: {
  organizationId: string;
  employeeId: string;
  maxDepth?: number;
}): Promise<readonly HrManagerChainEntry[]> {
  return resolveHrManagerApprovalChain(input);
}

export type HrOrgStructureExportRow = {
  recordType: "org_unit" | "position" | "reporting_line";
  code: string;
  name: string;
  status: string;
  parentOrDepartment: string | null;
  manager: string | null;
  location: string | null;
  legalEntity: string | null;
  effectiveFrom: string;
};

export async function exportHrOrgStructureRows(input: {
  organizationId: string;
  asOf?: Date;
}): Promise<readonly HrOrgStructureExportRow[]> {
  const asOf = input.asOf ?? new Date();
  const [units, positions, reportingLines] = await Promise.all([
    listHrOrgUnitsWindow({
      organizationId: input.organizationId,
      limit: HR_MAX_PAGE_SIZE,
      asOf,
    }),
    listHrOrgPositionsWindow({
      organizationId: input.organizationId,
      limit: HR_MAX_PAGE_SIZE,
      asOf,
    }),
    listHrOrgReportingLinesWindow({
      organizationId: input.organizationId,
      limit: HR_MAX_PAGE_SIZE,
      asOf,
    }),
  ]);

  const exportRows: HrOrgStructureExportRow[] = [];

  for (const unit of units.rows) {
    exportRows.push({
      recordType: "org_unit",
      code: unit.code,
      name: unit.name,
      status: unit.orgUnitStatus,
      parentOrDepartment: unit.parentDepartmentName,
      manager: unit.managerDisplayName,
      location: unit.locationCode,
      legalEntity: unit.legalEntityCode,
      effectiveFrom: unit.effectiveFrom.toISOString(),
    });
  }

  for (const position of positions.rows) {
    exportRows.push({
      recordType: "position",
      code: position.code,
      name: position.title,
      status: position.occupancyStatus,
      parentOrDepartment: position.departmentName,
      manager: position.managerDisplayName,
      location: position.locationCode,
      legalEntity: null,
      effectiveFrom: position.effectiveFrom.toISOString(),
    });
  }

  for (const line of reportingLines.rows) {
    exportRows.push({
      recordType: "reporting_line",
      code: line.employeeNumber,
      name: line.employeeDisplayName,
      status: line.relationshipType,
      parentOrDepartment: line.departmentName,
      manager: line.managerDisplayName,
      location: null,
      legalEntity: null,
      effectiveFrom: line.effectiveFrom.toISOString(),
    });
  }

  return exportRows;
}

export async function upsertHrOrgUnit(input: {
  organizationId: string;
  id?: string;
  code: string;
  name: string;
  unitType: HrOrgUnitType;
  parentDepartmentId?: string | null;
  managerEmployeeId?: string | null;
  costCenterCode?: string | null;
  locationCode?: string | null;
  legalEntityCode?: string | null;
  orgUnitStatus?: HrOrgUnitStatus;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  changedByUserId?: string | null;
}) {
  const effectiveFrom = input.effectiveFrom ?? new Date();
  const unitId = input.id ?? createEntityId("hr_dept");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    await assertNoOrgUnitHierarchyLoop(db, {
      organizationId: input.organizationId,
      unitId,
      parentDepartmentId: input.parentDepartmentId,
    });

    const [existing] = input.id
      ? await db
          .select()
          .from(hrDepartments)
          .where(
            and(
              eq(hrDepartments.organizationId, input.organizationId),
              eq(hrDepartments.id, input.id),
            ),
          )
          .limit(1)
      : [];

    if (!input.id) {
      const [duplicate] = await db
        .select({ id: hrDepartments.id })
        .from(hrDepartments)
        .where(
          and(
            eq(hrDepartments.organizationId, input.organizationId),
            eq(hrDepartments.code, input.code.trim()),
          ),
        )
        .limit(1);

      if (duplicate) {
        throw new HrOrgCommandError(
          "duplicate_code",
          "Organization unit code already exists.",
        );
      }
    }

    const payload = {
      code: input.code.trim(),
      name: input.name.trim(),
      unitType: input.unitType,
      parentDepartmentId: input.parentDepartmentId ?? null,
      managerEmployeeId: input.managerEmployeeId ?? null,
      costCenterCode: input.costCenterCode?.trim() || null,
      locationCode: input.locationCode?.trim() || null,
      legalEntityCode: input.legalEntityCode?.trim() || null,
      orgUnitStatus: input.orgUnitStatus ?? "active",
      effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    };

    if (existing) {
      await db
        .update(hrDepartments)
        .set(payload)
        .where(eq(hrDepartments.id, existing.id));

      await insertOrgStructureAuditEvent(db, {
        organizationId: input.organizationId,
        entityType: "org_unit",
        entityId: existing.id,
        action: "updated",
        previousPayload: JSON.stringify(existing),
        newPayload: JSON.stringify({ ...existing, ...payload }),
        effectiveFrom,
        changedByUserId: input.changedByUserId,
      });

      return { id: existing.id, created: false };
    }

    await db.insert(hrDepartments).values({
      id: unitId,
      organizationId: input.organizationId,
      ...payload,
    });

    await insertOrgStructureAuditEvent(db, {
      organizationId: input.organizationId,
      entityType: "org_unit",
      entityId: unitId,
      action: "created",
      newPayload: JSON.stringify({ id: unitId, ...payload }),
      effectiveFrom,
      changedByUserId: input.changedByUserId,
    });

    return { id: unitId, created: true };
  });
}

export async function upsertHrOrgPosition(input: {
  organizationId: string;
  id?: string;
  code: string;
  title: string;
  departmentId: string;
  managerEmployeeId?: string | null;
  costCenterCode?: string | null;
  locationCode?: string | null;
  positionStatus?: HrOrgUnitStatus;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  changedByUserId?: string | null;
}) {
  const effectiveFrom = input.effectiveFrom ?? new Date();
  const positionId = input.id ?? createEntityId("hr_pos");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [department] = await db
      .select({ id: hrDepartments.id })
      .from(hrDepartments)
      .where(
        and(
          eq(hrDepartments.organizationId, input.organizationId),
          eq(hrDepartments.id, input.departmentId),
        ),
      )
      .limit(1);

    if (!department) {
      throw new HrOrgCommandError(
        "department_not_found",
        "Organization unit not found for position assignment.",
      );
    }

    const [existing] = input.id
      ? await db
          .select()
          .from(hrPositions)
          .where(
            and(
              eq(hrPositions.organizationId, input.organizationId),
              eq(hrPositions.id, input.id),
            ),
          )
          .limit(1)
      : [];

    if (!input.id) {
      const [duplicate] = await db
        .select({ id: hrPositions.id })
        .from(hrPositions)
        .where(
          and(
            eq(hrPositions.organizationId, input.organizationId),
            eq(hrPositions.code, input.code.trim()),
          ),
        )
        .limit(1);

      if (duplicate) {
        throw new HrOrgCommandError(
          "duplicate_code",
          "Position code already exists.",
        );
      }
    }

    const payload = {
      code: input.code.trim(),
      title: input.title.trim(),
      departmentId: input.departmentId,
      managerEmployeeId: input.managerEmployeeId ?? null,
      costCenterCode: input.costCenterCode?.trim() || null,
      locationCode: input.locationCode?.trim() || null,
      positionStatus: input.positionStatus ?? "active",
      effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    };

    if (existing) {
      await db
        .update(hrPositions)
        .set(payload)
        .where(eq(hrPositions.id, existing.id));

      await insertOrgStructureAuditEvent(db, {
        organizationId: input.organizationId,
        entityType: "position",
        entityId: existing.id,
        action: "updated",
        previousPayload: JSON.stringify(existing),
        newPayload: JSON.stringify({ ...existing, ...payload }),
        effectiveFrom,
        changedByUserId: input.changedByUserId,
      });

      return { id: existing.id, created: false };
    }

    await db.insert(hrPositions).values({
      id: positionId,
      organizationId: input.organizationId,
      ...payload,
    });

    await insertOrgStructureAuditEvent(db, {
      organizationId: input.organizationId,
      entityType: "position",
      entityId: positionId,
      action: "created",
      newPayload: JSON.stringify({ id: positionId, ...payload }),
      effectiveFrom,
      changedByUserId: input.changedByUserId,
    });

    return { id: positionId, created: true };
  });
}

export async function upsertHrReportingRelationship(input: {
  organizationId: string;
  id?: string;
  employeeId: string;
  managerEmployeeId: string;
  relationshipType: HrReportingRelationshipType;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  reason?: string | null;
  changedByUserId?: string | null;
}) {
  const effectiveFrom = input.effectiveFrom ?? new Date();
  const relationshipId = input.id ?? createEntityId("hr_reporting");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employeeIds = [input.employeeId, input.managerEmployeeId];
    const employees = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          inArray(hrEmployees.id, employeeIds),
        ),
      );

    if (employees.length !== 2) {
      throw new HrOrgCommandError(
        "employee_not_found",
        "Employee or manager not found for reporting relationship.",
      );
    }

    const payload = {
      employeeId: input.employeeId,
      managerEmployeeId: input.managerEmployeeId,
      relationshipType: input.relationshipType,
      effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
      assignmentStatus: "active" as const,
      reason: input.reason?.trim() || null,
    };

    const [existing] = input.id
      ? await db
          .select()
          .from(hrReportingRelationships)
          .where(
            and(
              eq(hrReportingRelationships.organizationId, input.organizationId),
              eq(hrReportingRelationships.id, input.id),
            ),
          )
          .limit(1)
      : [];

    if (existing) {
      await db
        .update(hrReportingRelationships)
        .set(payload)
        .where(eq(hrReportingRelationships.id, existing.id));

      if (input.relationshipType === "direct") {
        await db
          .update(hrEmployees)
          .set({ managerEmployeeId: input.managerEmployeeId })
          .where(
            and(
              eq(hrEmployees.organizationId, input.organizationId),
              eq(hrEmployees.id, input.employeeId),
            ),
          );
      }

      await insertOrgStructureAuditEvent(db, {
        organizationId: input.organizationId,
        entityType: "reporting_line",
        entityId: existing.id,
        action: "updated",
        previousPayload: JSON.stringify(existing),
        newPayload: JSON.stringify({ ...existing, ...payload }),
        effectiveFrom,
        changedByUserId: input.changedByUserId,
      });

      return { id: existing.id, created: false };
    }

    await db.insert(hrReportingRelationships).values({
      id: relationshipId,
      organizationId: input.organizationId,
      ...payload,
    });

    if (input.relationshipType === "direct") {
      await db
        .update(hrEmployees)
        .set({ managerEmployeeId: input.managerEmployeeId })
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            eq(hrEmployees.id, input.employeeId),
          ),
        );
    }

    await insertOrgStructureAuditEvent(db, {
      organizationId: input.organizationId,
      entityType: "reporting_line",
      entityId: relationshipId,
      action: "created",
      newPayload: JSON.stringify({ id: relationshipId, ...payload }),
      effectiveFrom,
      changedByUserId: input.changedByUserId,
    });

    return { id: relationshipId, created: true };
  });
}

export async function listHrVacantPositionsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  departmentId?: string;
  locationCode?: string;
  asOf?: Date;
}): Promise<HrOrgPositionWindow> {
  return listHrOrgPositionsWindow({
    ...input,
    occupancyStatus: "vacant",
    positionStatus: "active",
  });
}
