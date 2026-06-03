import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { archiveHrEmployeeDocumentsOnSeparationInTx } from "./hr-documents";
import { createEntityId } from "./ids";
import {
  hrDepartments,
  hrEmployeeAssignments,
  hrEmployees,
  hrPositions,
} from "./hr";

export type HrEmployeeCommandErrorCode =
  | "employee_not_found"
  | "employee_archived"
  | "duplicate_employee_number"
  | "duplicate_email"
  | "duplicate_identity_number"
  | "duplicate_phone"
  | "invalid_manager"
  | "invalid_department"
  | "invalid_position";

export class HrEmployeeCommandError extends Error {
  readonly code: HrEmployeeCommandErrorCode;

  constructor(code: HrEmployeeCommandErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export type HrEmployeePlacementInput = {
  currentDepartmentId?: string | null;
  currentPositionId?: string | null;
  managerEmployeeId?: string | null;
};

export type CreateHrEmployeeInput = {
  organizationId: string;
  employeeNumber: string;
  legalName: string;
  preferredName?: string | null;
  email?: string | null;
  placement?: HrEmployeePlacementInput;
  assignmentReason?: string | null;
};

export type UpdateHrEmployeeCoreInput = {
  organizationId: string;
  employeeId: string;
  employeeNumber?: string;
  legalName?: string;
  preferredName?: string | null;
  email?: string | null;
  employmentStatus?: (typeof hrEmployees.$inferInsert)["employmentStatus"];
  placement?: HrEmployeePlacementInput;
  assignmentReason?: string | null;
};

export type HrEmployeeAssignmentRow = {
  id: string;
  employeeId: string;
  departmentId: string | null;
  positionId: string | null;
  managerEmployeeId: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  assignmentStatus: (typeof hrEmployeeAssignments.$inferSelect)["assignmentStatus"];
  reason: string | null;
};

function normalizeEmployeeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || null;
}

async function assertEmployeeWritable(
  db: AfendaTransaction,
  organizationId: string,
  employeeId: string,
) {
  const [employee] = await db
    .select({
      id: hrEmployees.id,
      employmentStatus: hrEmployees.employmentStatus,
      archivedAt: hrEmployees.archivedAt,
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
    throw new HrEmployeeCommandError("employee_not_found");
  }
  if (
    employee.archivedAt ||
    employee.employmentStatus === "separated" ||
    employee.employmentStatus === "terminated" ||
    employee.employmentStatus === "retired"
  ) {
    throw new HrEmployeeCommandError("employee_archived");
  }

  return employee;
}

async function assertNoDuplicateEmployeeIdentity(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeNumber?: string;
    email?: string | null;
    excludeEmployeeId?: string;
  },
) {
  const trimmedNumber = input.employeeNumber?.trim();
  const normalizedEmail = normalizeEmployeeEmail(input.email);

  if (trimmedNumber) {
    const numberConditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      eq(hrEmployees.employeeNumber, trimmedNumber),
    ];
    if (input.excludeEmployeeId) {
      numberConditions.push(ne(hrEmployees.id, input.excludeEmployeeId));
    }
    const [duplicateNumber] = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(and(...numberConditions))
      .limit(1);
    if (duplicateNumber) {
      throw new HrEmployeeCommandError("duplicate_employee_number");
    }
  }

  if (normalizedEmail) {
    const emailConditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      sql`lower(${hrEmployees.email}) = ${normalizedEmail}`,
    ];
    if (input.excludeEmployeeId) {
      emailConditions.push(ne(hrEmployees.id, input.excludeEmployeeId));
    }
    const [duplicateEmail] = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(and(...emailConditions))
      .limit(1);
    if (duplicateEmail) {
      throw new HrEmployeeCommandError("duplicate_email");
    }
  }
}

async function assertManagerInOrganization(
  db: AfendaTransaction,
  organizationId: string,
  managerEmployeeId: string | null | undefined,
  employeeId?: string,
) {
  if (!managerEmployeeId) return;
  if (employeeId && managerEmployeeId === employeeId) {
    throw new HrEmployeeCommandError("invalid_manager");
  }

  const [manager] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, organizationId),
        eq(hrEmployees.id, managerEmployeeId),
        isNull(hrEmployees.archivedAt),
      ),
    )
    .limit(1);

  if (!manager) {
    throw new HrEmployeeCommandError("invalid_manager");
  }
}

async function assertDepartmentInOrganization(
  db: AfendaTransaction,
  organizationId: string,
  departmentId: string | null | undefined,
) {
  if (!departmentId) return;

  const [department] = await db
    .select({ id: hrDepartments.id })
    .from(hrDepartments)
    .where(
      and(
        eq(hrDepartments.organizationId, organizationId),
        eq(hrDepartments.id, departmentId),
        isNull(hrDepartments.archivedAt),
      ),
    )
    .limit(1);

  if (!department) {
    throw new HrEmployeeCommandError("invalid_department");
  }
}

async function assertPositionInOrganization(
  db: AfendaTransaction,
  organizationId: string,
  positionId: string | null | undefined,
) {
  if (!positionId) return;

  const [position] = await db
    .select({ id: hrPositions.id })
    .from(hrPositions)
    .where(
      and(
        eq(hrPositions.organizationId, organizationId),
        eq(hrPositions.id, positionId),
        isNull(hrPositions.archivedAt),
      ),
    )
    .limit(1);

  if (!position) {
    throw new HrEmployeeCommandError("invalid_position");
  }
}

function placementProvided(
  placement: HrEmployeePlacementInput | undefined,
): placement is HrEmployeePlacementInput {
  if (!placement) return false;
  return (
    Object.prototype.hasOwnProperty.call(placement, "currentDepartmentId") ||
    Object.prototype.hasOwnProperty.call(placement, "currentPositionId") ||
    Object.prototype.hasOwnProperty.call(placement, "managerEmployeeId")
  );
}

export async function upsertHrEmployeeEffectiveAssignmentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    effectiveFrom?: Date;
    placement: HrEmployeePlacementInput;
    reason?: string | null;
  },
): Promise<{ assignmentId: string | null; changedFields: string[] }> {
    const effectiveFrom = input.effectiveFrom ?? new Date();
    const changedFields: string[] = [];

    const [employee] = await db
      .select({
        currentDepartmentId: hrEmployees.currentDepartmentId,
        currentPositionId: hrEmployees.currentPositionId,
        managerEmployeeId: hrEmployees.managerEmployeeId,
      })
      .from(hrEmployees)
      .where(eq(hrEmployees.id, input.employeeId))
      .limit(1);

    const nextDepartmentId = Object.prototype.hasOwnProperty.call(
      input.placement,
      "currentDepartmentId",
    )
      ? (input.placement.currentDepartmentId ?? null)
      : employee?.currentDepartmentId ?? null;
    const nextPositionId = Object.prototype.hasOwnProperty.call(
      input.placement,
      "currentPositionId",
    )
      ? (input.placement.currentPositionId ?? null)
      : employee?.currentPositionId ?? null;
    const nextManagerId = Object.prototype.hasOwnProperty.call(
      input.placement,
      "managerEmployeeId",
    )
      ? (input.placement.managerEmployeeId ?? null)
      : employee?.managerEmployeeId ?? null;

    await assertManagerInOrganization(
      db,
      input.organizationId,
      nextManagerId,
      input.employeeId,
    );
    await assertDepartmentInOrganization(
      db,
      input.organizationId,
      nextDepartmentId,
    );
    await assertPositionInOrganization(
      db,
      input.organizationId,
      nextPositionId,
    );

    if (employee?.currentDepartmentId !== nextDepartmentId) {
      changedFields.push("currentDepartmentId");
    }
    if (employee?.currentPositionId !== nextPositionId) {
      changedFields.push("currentPositionId");
    }
    if (employee?.managerEmployeeId !== nextManagerId) {
      changedFields.push("managerEmployeeId");
    }

    if (changedFields.length === 0) {
      return { assignmentId: null, changedFields };
    }

    const [activeAssignment] = await db
      .select({ id: hrEmployeeAssignments.id })
      .from(hrEmployeeAssignments)
      .where(
        and(
          eq(hrEmployeeAssignments.organizationId, input.organizationId),
          eq(hrEmployeeAssignments.employeeId, input.employeeId),
          eq(hrEmployeeAssignments.assignmentStatus, "active"),
          isNull(hrEmployeeAssignments.effectiveTo),
        ),
      )
      .limit(1);

    if (activeAssignment) {
      await db
        .update(hrEmployeeAssignments)
        .set({
          effectiveTo: effectiveFrom,
          assignmentStatus: "superseded",
        })
        .where(eq(hrEmployeeAssignments.id, activeAssignment.id));
    }

    const assignmentId = createEntityId("hr_asg");
    await db.insert(hrEmployeeAssignments).values({
      id: assignmentId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      departmentId: nextDepartmentId,
      positionId: nextPositionId,
      managerEmployeeId: nextManagerId,
      effectiveFrom,
      assignmentStatus: "active",
      reason: input.reason ?? null,
    });

    await db
      .update(hrEmployees)
      .set({
        currentDepartmentId: nextDepartmentId,
        currentPositionId: nextPositionId,
        managerEmployeeId: nextManagerId,
      })
      .where(eq(hrEmployees.id, input.employeeId));

    return { assignmentId, changedFields };
}

export async function upsertHrEmployeeEffectiveAssignment(input: {
  organizationId: string;
  employeeId: string;
  effectiveFrom?: Date;
  placement: HrEmployeePlacementInput;
  reason?: string | null;
}): Promise<{ assignmentId: string | null; changedFields: string[] }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await assertEmployeeWritable(db, input.organizationId, input.employeeId);
    return upsertHrEmployeeEffectiveAssignmentInTx(db, input);
  });
}

export async function createHrEmployee(
  input: CreateHrEmployeeInput,
): Promise<{ employeeId: string; assignmentId: string | null }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employeeNumber = input.employeeNumber.trim();
    const legalName = input.legalName.trim();

    await assertNoDuplicateEmployeeIdentity(db, {
      organizationId: input.organizationId,
      employeeNumber,
      email: input.email ?? null,
    });

    if (placementProvided(input.placement)) {
      await assertManagerInOrganization(
        db,
        input.organizationId,
        input.placement.managerEmployeeId,
      );
    }

    const employeeId = createEntityId("hr_emp");
    await db.insert(hrEmployees).values({
      id: employeeId,
      organizationId: input.organizationId,
      employeeNumber,
      legalName,
      preferredName: input.preferredName?.trim() || null,
      email: input.email?.trim() || null,
      employmentStatus: "active",
      currentDepartmentId: null,
      currentPositionId: null,
      managerEmployeeId: null,
    });

    if (!placementProvided(input.placement)) {
      return { employeeId, assignmentId: null };
    }

    const assignment = await upsertHrEmployeeEffectiveAssignmentInTx(db, {
      organizationId: input.organizationId,
      employeeId,
      placement: input.placement,
      reason: input.assignmentReason ?? "initial_placement",
    });

    return { employeeId, assignmentId: assignment.assignmentId };
  });
}

export async function updateHrEmployeeCoreInTx(
  db: AfendaTransaction,
  input: UpdateHrEmployeeCoreInput,
): Promise<{ employeeId: string; changedFields: string[]; assignmentId: string | null }> {
  await assertEmployeeWritable(db, input.organizationId, input.employeeId);

  const [existing] = await db
    .select({
      employeeNumber: hrEmployees.employeeNumber,
      legalName: hrEmployees.legalName,
      preferredName: hrEmployees.preferredName,
      email: hrEmployees.email,
      employmentStatus: hrEmployees.employmentStatus,
    })
    .from(hrEmployees)
    .where(eq(hrEmployees.id, input.employeeId))
    .limit(1);

  if (!existing) {
    throw new HrEmployeeCommandError("employee_not_found");
  }

  const nextEmployeeNumber = input.employeeNumber?.trim() ?? existing.employeeNumber;
  const nextLegalName = input.legalName?.trim() ?? existing.legalName;
  const nextPreferredName =
    input.preferredName !== undefined
      ? input.preferredName?.trim() || null
      : existing.preferredName;
  const nextEmail =
    input.email !== undefined ? input.email?.trim() || null : existing.email;

  await assertNoDuplicateEmployeeIdentity(db, {
    organizationId: input.organizationId,
    employeeNumber: nextEmployeeNumber,
    email: nextEmail,
    excludeEmployeeId: input.employeeId,
  });

  const changedFields: string[] = [];
  if (existing.employeeNumber !== nextEmployeeNumber) {
    changedFields.push("employeeNumber");
  }
  if (existing.legalName !== nextLegalName) {
    changedFields.push("legalName");
  }
  if (existing.preferredName !== nextPreferredName) {
    changedFields.push("preferredName");
  }
  if (existing.email !== nextEmail) {
    changedFields.push("email");
  }
  if (
    input.employmentStatus &&
    input.employmentStatus !== existing.employmentStatus
  ) {
    changedFields.push("employmentStatus");
  }

  if (changedFields.length > 0) {
    await db
      .update(hrEmployees)
      .set({
        employeeNumber: nextEmployeeNumber,
        legalName: nextLegalName,
        preferredName: nextPreferredName,
        email: nextEmail,
        ...(input.employmentStatus
          ? { employmentStatus: input.employmentStatus }
          : {}),
      })
      .where(eq(hrEmployees.id, input.employeeId));
  }

  let assignmentId: string | null = null;
  if (placementProvided(input.placement)) {
    const assignment = await upsertHrEmployeeEffectiveAssignmentInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      placement: input.placement,
      reason: input.assignmentReason ?? "placement_update",
    });
    assignmentId = assignment.assignmentId;
    changedFields.push(...assignment.changedFields);
  }

  return {
    employeeId: input.employeeId,
    changedFields,
    assignmentId,
  };
}

export async function updateHrEmployeeCore(
  input: UpdateHrEmployeeCoreInput,
): Promise<{ employeeId: string; changedFields: string[]; assignmentId: string | null }> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    updateHrEmployeeCoreInTx(db, input),
  );
}

export async function archiveHrEmployeeInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
  },
): Promise<{ employeeId: string }> {
  await assertEmployeeWritable(db, input.organizationId, input.employeeId);

  const archivedAt = new Date();

  await db
    .update(hrEmployees)
    .set({
      archivedAt,
      employmentStatus: "archived",
    })
    .where(eq(hrEmployees.id, input.employeeId));

  await db
    .update(hrEmployeeAssignments)
    .set({
      effectiveTo: archivedAt,
      assignmentStatus: "cancelled",
    })
    .where(
      and(
        eq(hrEmployeeAssignments.organizationId, input.organizationId),
        eq(hrEmployeeAssignments.employeeId, input.employeeId),
        eq(hrEmployeeAssignments.assignmentStatus, "active"),
        isNull(hrEmployeeAssignments.effectiveTo),
      ),
    );

  await archiveHrEmployeeDocumentsOnSeparationInTx(db, {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  });

  return { employeeId: input.employeeId };
}

export async function archiveHrEmployee(input: {
  organizationId: string;
  employeeId: string;
}): Promise<{ employeeId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    archiveHrEmployeeInTx(db, input),
  );
}

export async function listHrEmployeeAssignments(input: {
  organizationId: string;
  employeeId: string;
  limit?: number;
}): Promise<readonly HrEmployeeAssignmentRow[]> {
  const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrEmployeeAssignments.id,
        employeeId: hrEmployeeAssignments.employeeId,
        departmentId: hrEmployeeAssignments.departmentId,
        positionId: hrEmployeeAssignments.positionId,
        managerEmployeeId: hrEmployeeAssignments.managerEmployeeId,
        effectiveFrom: hrEmployeeAssignments.effectiveFrom,
        effectiveTo: hrEmployeeAssignments.effectiveTo,
        assignmentStatus: hrEmployeeAssignments.assignmentStatus,
        reason: hrEmployeeAssignments.reason,
      })
      .from(hrEmployeeAssignments)
      .where(
        and(
          eq(hrEmployeeAssignments.organizationId, input.organizationId),
          eq(hrEmployeeAssignments.employeeId, input.employeeId),
        ),
      )
      .orderBy(hrEmployeeAssignments.effectiveFrom)
      .limit(limit);

    return rows;
  });
}
